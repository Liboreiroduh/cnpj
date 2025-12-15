import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const cnpj = searchParams.get('cnpj');

  if (!cnpj) {
    return NextResponse.json(
      { error: 'CNPJ não fornecido' },
      { status: 400 }
    );
  }

  // Remove caracteres não numéricos
  const cleanCnpj = cnpj.replace(/\D/g, '');

  if (cleanCnpj.length !== 14) {
    return NextResponse.json(
      { error: 'CNPJ inválido. Deve conter 14 dígitos.' },
      { status: 400 }
    );
  }

  // Lista de APIs públicas para CNPJ - APENAS COM CONTATOS
  const apis = [
    {
      name: 'CNPJ.ws (pública)',
      url: `https://publica.cnpj.ws/cnpj/${cleanCnpj}`,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      }
    },
    {
      name: 'ReceitaWS',
      url: `https://receitaws.com.br/v1/cnpj/${cleanCnpj}`,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Python/3.9.0'
      }
    }
  ];

  let lastError: Error | null = null;

  // Tenta cada API em sequência - APENAS COM CONTATOS
  for (const api of apis) {
    try {
      console.log(`Tentando API: ${api.name} - ${api.url}`);
      
      const response = await fetch(api.url, {
        method: 'GET',
        headers: api.headers,
        timeout: 10000
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log(`✅ Sucesso com ${api.name}`);
        
        // Verificar se tem contatos
        let hasPhone = false;
        let hasEmail = false;
        let telefonesArray: Array<{ddd?: string, numero?: string, is_fax?: boolean}> = [];
        let email = null;
        
        // CNPJ.ws
        if (api.name.includes('CNPJ.ws')) {
          hasPhone = !!(data.estabelecimento?.telefone1 || data.estabelecimento?.telefone2);
          hasEmail = !!(data.estabelecimento?.email || data.email);
          
          if (data.estabelecimento?.telefone1 && data.estabelecimento?.ddd1) {
            telefonesArray.push({
              ddd: data.estabelecimento.ddd1,
              numero: data.estabelecimento.telefone1,
              is_fax: false
            });
          }
          if (data.estabelecimento?.telefone2 && data.estabelecimento?.ddd2) {
            telefonesArray.push({
              ddd: data.estabelecimento.ddd2,
              numero: data.estabelecimento.telefone2,
              is_fax: false
            });
          }
          
          email = data.estabelecimento?.email || data.email || null;
        }
        
        // ReceitaWS
        if (api.name.includes('ReceitaWS')) {
          hasPhone = !!data.telefone;
          hasEmail = !!data.email;
          
          if (data.telefone) {
            const tel = data.telefone.toString();
            const cleanedTel = tel.replace(/\D/g, '');
            if (cleanedTel.length >= 10) {
              telefonesArray.push({
                ddd: cleanedTel.substring(0, 2),
                numero: cleanedTel.substring(2),
                is_fax: false
              });
            }
          }
          
          email = data.email || null;
        }
        
        // Se não tem contatos, tenta próxima API
        if (!hasPhone && !hasEmail) {
          console.log(`❌ ${api.name} não tem contatos, tentando próxima...`);
          lastError = new Error(`API sem contatos: ${api.name}`);
          continue;
        }
        
        console.log(`✅ ${api.name} TEM CONTATOS - Telefone: ${hasPhone}, Email: ${hasEmail}`);
        
        // Mapear dados COMPLETOS para o frontend
        const mappedData = {
          // Dados principais
          cnpj: data.cnpj || data.estabelecimento?.cnpj || cleanCnpj,
          razao_social: data.razao_social || data.nome,
          nome_fantasia: data.nome_fantasia || data.fantasia || data.estabelecimento?.nome_fantasia,
          
          // Situação cadastral
          situacao_cadastral: {
            situacao: data.situacao_cadastral || data.estabelecimento?.situacao_cadastral || data.situacao || data.descricao_situacao_cadastral,
            data_situacao: data.data_situacao_cadastral || data.estabelecimento?.data_situacao_cadastral || data.data_situacao || data.data_situacao_cadastral,
            motivo: data.motivo_situacao_cadastral || data.estabelecimento?.motivo_situacao_cadastral || data.motivo_situacao || data.descricao_motivo_situacao_cadastral
          },
          
          // Natureza jurídica e porte
          natureza_juridica: data.natureza_juridica || {
            descricao: data.natureza_juridica?.descricao || data.natureza_juridica
          },
          porte: data.porte?.descricao || data.porte_empresa || data.porte || data.descricao_porte,
          
          // Capital social e datas
          capital_social: parseFloat(data.capital_social?.replace(',', '.') || data.capital_social?.replace('.', '') || '0'),
          data_inicio_atividade: data.data_inicio_atividade || data.estabelecimento?.data_inicio_atividade || data.abertura,
          matriz_filial: data.matriz_filial || data.estabelecimento?.tipo || data.tipo || data.descricao_identificador_matriz_filial,
          
          // CNAEs
          cnae_principal: (() => {
            if (data.cnae_principal) {
              return {
                codigo: data.cnae_principal.codigo || data.cnae_principal,
                descricao: data.cnae_principal.descricao || data.estabelecimento?.atividade_principal?.descricao
              };
            }
            if (data.estabelecimento?.atividade_principal) {
              return {
                codigo: data.estabelecimento.atividade_principal.subclasse || data.estabelecimento.atividade_principal.id,
                descricao: data.estabelecimento.atividade_principal.descricao
              };
            }
            if (data.atividade_principal && data.atividade_principal[0]) {
              return {
                codigo: data.atividade_principal[0].code,
                descricao: data.atividade_principal[0].text
              };
            }
            return undefined;
          })(),
          
          cnaes_secundarios: (() => {
            if (data.cnaes_secundarios && data.cnaes_secundarios.length > 0) {
              return data.cnaes_secundarios.map((ativ: any) => ({
                codigo: ativ.codigo || ativ.subclasse || ativ.id,
                descricao: ativ.descricao
              }));
            }
            if (data.estabelecimento?.atividades_secundarias && data.estabelecimento.atividades_secundarias.length > 0) {
              return data.estabelecimento.atividades_secundarias.map((ativ: any) => ({
                codigo: ativ.codigo || ativ.subclasse || ativ.id,
                descricao: ativ.descricao
              }));
            }
            if (data.atividades_secundarias && data.atividades_secundarias.length > 0) {
              return data.atividades_secundarias.map((ativ: any) => ({
                codigo: ativ.code,
                descricao: ativ.text
              }));
            }
            return [];
          })(),
          
          // Endereço completo
          logradouro: (() => {
            if (data.logradouro) return data.logradouro;
            if (data.estabelecimento?.logradouro) return data.estabelecimento.logradouro;
            if (data.estabelecimento?.tipo_logradouro && data.estabelecimento?.logradouro) {
              return `${data.estabelecimento.tipo_logradouro} ${data.estabelecimento.logradouro}`;
            }
            return null;
          })(),
          numero: data.numero || data.estabelecimento?.numero,
          complemento: data.complemento || data.estabelecimento?.complemento,
          bairro: data.bairro || data.estabelecimento?.bairro,
          municipio: data.municipio || data.estabelecimento?.cidade?.nome || data.nome_municipio,
          uf: data.uf || data.estabelecimento?.estado?.sigla,
          cep: data.cep || data.estabelecimento?.cep,
          codigo_ibge: data.estabelecimento?.cidade?.ibge_id?.toString() || data.codigo_municipio_ibge?.toString(),
          
          // CONTATOS - GARANTIDO
          telefones: telefonesArray,
          email: email,
          
          // Informações fiscais
          opcao_simples: (() => {
            if (data.opcao_simples) return data.opcao_simples;
            if (data.simples?.simples === 'Sim') return 'S';
            if (data.simples?.optante) return 'S';
            return 'N';
          })(),
          data_opcao_simples: data.data_opcao_simples || data.simples?.data_opcao_simples || data.simples?.data_opcao || data.data_opcao_pelo_simples,
          opcao_mei: (() => {
            if (data.opcao_mei) return data.opcao_mei;
            if (data.simples?.mei === 'Sim') return 'S';
            if (data.simples?.optante) return 'N';
            return 'N';
          })(),
          data_opcao_mei: data.data_opcao_mei || data.simples?.data_opcao_mei || data.simples?.data_exclusao_mei || data.data_opcao_pelo_mei,
          
          // Quadro societário (QSA)
          quadro_societario: (() => {
            if (data.QSA && data.QSA.length > 0) {
              return data.QSA.map((socio: any) => ({
                nome: socio.nome,
                documento: socio.cpf_cnpj_socio,
                tipo: socio.tipo === 'Pessoa Física' ? 'PF' : 'PJ',
                qualificacao: socio.qualificacao_socio?.descricao || socio.qualificacao_socio,
                data_entrada: socio.data_entrada,
                faixa_etaria: socio.faixa_etaria
              }));
            }
            if (data.socios && data.socios.length > 0) {
              return data.socios.map((socio: any) => ({
                nome: socio.nome || socio.nome_socio,
                documento: socio.cpf_cnpj_socio || socio.documento || socio.cnpj_cpf_do_socio,
                tipo: socio.identificador_socio === 'Pessoa Física' || socio.tipo === 'Pessoa Física' || socio.identificador_de_socio === 2 ? 'PF' : 'PJ',
                qualificacao: socio.qualificacao_socio?.descricao || socio.qualificacao_socio || socio.qualificacao || socio.qualificacao_socio,
                data_entrada: socio.data_entrada_sociedade || socio.data_entrada,
                faixa_etaria: socio.faixa_etaria || socio.descricao_faixa_etaria
              }));
            }
            if (data.qsa && data.qsa.length > 0) {
              return data.qsa.map((socio: any) => ({
                nome: socio.nome_socio,
                documento: socio.cnpj_cpf_do_socio,
                tipo: socio.identificador_de_socio === 2 ? 'PF' : 'PJ',
                qualificacao: socio.qualificacao_socio,
                data_entrada: socio.data_entrada_sociedade,
                faixa_etaria: socio.descricao_faixa_etaria
              }));
            }
            return [];
          })(),
          
          // Metadata da API usada
          _api_info: {
            fonte: api.name,
            url: api.url,
            timestamp: new Date().toISOString()
          }
        };
        
        console.log(`📋 Dados mapeados - Telefone: ${mappedData.telefones.length}, Email: ${mappedData.email ? 'Sim' : 'Não'}`);
        
        return NextResponse.json(mappedData);
      }
      
      if (response.status === 404) {
        console.log(`❌ CNPJ não encontrado em ${api.name}`);
        lastError = new Error(`CNPJ não encontrado em ${api.name}`);
        continue;
      }
      
      if (response.status === 429) {
        console.log(`⏱️ Rate limit em ${api.name}, tentando próxima...`);
        lastError = new Error(`Rate limit excedido em ${api.name}`);
        continue;
      }
      
      console.log(`❌ Erro ${response.status} em ${api.name}`);
      lastError = new Error(`Erro ${response.status} em ${api.name}`);
      
    } catch (err) {
      console.log(`💥 Falha ao conectar com ${api.name}:`, err);
      lastError = err as Error;
      continue;
    }
  }

  // Se todas as APIs com contatos falharam, retorna erro com timer
  console.error('❌ Todas as APIs com contatos falharam');
  return NextResponse.json(
    { 
      error: '⏱️ Limite de consultas atingido. Todas as APIs com dados de contato estão temporariamente indisponíveis.',
      detalhes: lastError?.message,
      timer: true,
      waitTime: 'Aguarde alguns minutos e tente novamente.',
      alternativas: 'CNPJ.ws, ReceitaWS'
    },
    { status: 429 }
  );
}