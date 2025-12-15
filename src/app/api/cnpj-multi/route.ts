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

  // Lista de APIs públicas para CNPJ
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
      name: 'MinhaReceita',
      url: `https://minhareceita.org/${cleanCnpj}`,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'curl/7.68.0'
      }
    },
    {
      name: 'OpenCNPJ',
      url: `https://api.opencnpj.org/cnpj/${cleanCnpj}`,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Java/11.0.1'
      }
    },
    {
      name: 'ReceitaWS (backup)',
      url: `https://receitaws.com.br/v1/cnpj/${cleanCnpj}`,
      headers: {
        'Accept': 'application/json',
        'User-Agent': 'Python/3.9.0'
      }
    }
  ];

  let lastError: Error | null = null;

  // Tenta cada API em sequência
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
        console.log(`✅ Sucesso com ${api.name}:`, JSON.stringify(data).substring(0, 200));
        
        // Mapear dados para o formato esperado pelo frontend
        const mappedData = {
          // Dados principais
          cnpj: data.cnpj || data.estabelecimento?.cnpj || cleanCnpj,
          razao_social: data.razao_social,
          nome_fantasia: data.nome_fantasia || data.estabelecimento?.nome_fantasia,
          
          // Situação cadastral
          situacao_cadastral: {
            situacao: data.situacao_cadastral || data.estabelecimento?.situacao_cadastral || data.descricao_situacao_cadastral,
            data_situacao: data.data_situacao_cadastral || data.estabelecimento?.data_situacao_cadastral || data.data_situacao_cadastral,
            motivo: data.motivo_situacao_cadastral || data.estabelecimento?.motivo_situacao_cadastral || data.descricao_motivo_situacao_cadastral,
            situacao_especial: data.situacao_especial || data.estabelecimento?.situacao_especial || data.situacao_especial,
            data_situacao_especial: data.data_situacao_especial || data.estabelecimento?.data_situacao_especial || data.data_situacao_especial
          },
          
          // Natureza jurídica e porte
          natureza_juridica: data.natureza_juridica || {
            descricao: data.natureza_juridica?.descricao || data.natureza_juridica
          },
          porte: data.porte?.descricao || data.porte_empresa || data.porte || data.descricao_porte,
          
          // Capital social e datas
          capital_social: parseFloat(data.capital_social?.replace(',', '.') || data.capital_social || '0'),
          data_inicio_atividade: data.data_inicio_atividade || data.estabelecimento?.data_inicio_atividade,
          matriz_filial: data.matriz_filial || data.estabelecimento?.tipo || data.descricao_identificador_matriz_filial,
          
          // CNAEs
          cnae_principal: data.cnae_principal ? {
            codigo: data.cnae_principal.codigo || data.cnae_principal || data.cnae_fiscal,
            descricao: data.cnae_principal.descricao || data.estabelecimento?.atividade_principal?.descricao || data.cnae_fiscal_descricao
          } : data.estabelecimento?.atividade_principal ? {
            codigo: data.estabelecimento.atividade_principal.subclasse || data.estabelecimento.atividade_principal.id,
            descricao: data.estabelecimento.atividade_principal.descricao
          } : data.cnae_fiscal ? {
            codigo: data.cnae_fiscal,
            descricao: data.cnae_fiscal_descricao
          } : undefined,
          
          cnaes_secundarios: data.cnaes_secundarios || data.estabelecimento?.atividades_secundarias?.map((ativ: any) => ({
            codigo: ativ.codigo || ativ.subclasse || ativ.id,
            descricao: ativ.descricao
          })) || data.cnaes_secundarios || [],
          
          // Endereço completo
          logradouro: data.logradouro || (data.estabelecimento?.tipo_logradouro ? 
            `${data.estabelecimento.tipo_logradouro} ${data.estabelecimento.logradouro}` : 
            data.estabelecimento?.logradouro) || data.descricao_tipo_de_logradouro ? 
            `${data.descricao_tipo_de_logradouro} ${data.logradouro}` : data.logradouro,
          numero: data.numero || data.estabelecimento?.numero,
          complemento: data.complemento || data.estabelecimento?.complemento,
          bairro: data.bairro || data.estabelecimento?.bairro,
          municipio: data.municipio || data.estabelecimento?.cidade?.nome || data.nome_municipio,
          uf: data.uf || data.estabelecimento?.estado?.sigla,
          cep: data.cep || data.estabelecimento?.cep,
          codigo_ibge: data.estabelecimento?.cidade?.ibge_id?.toString() || data.codigo_municipio_ibge?.toString(),
          
          // CONTATOS - MAPEAMENTO COMPLETO
          telefones: (() => {
            const telefonesArray: Array<{ddd?: string, numero?: string, is_fax?: boolean}> = [];
            
            // API CNPJ.ws
            if (data.estabelecimento?.ddd1 && data.estabelecimento?.telefone1) {
              telefonesArray.push({
                ddd: data.estabelecimento.ddd1,
                numero: data.estabelecimento.telefone1,
                is_fax: false
              });
            }
            if (data.estabelecimento?.ddd2 && data.estabelecimento?.telefone2) {
              telefonesArray.push({
                ddd: data.estabelecimento.ddd2,
                numero: data.estabelecimento.telefone2,
                is_fax: false
              });
            }
            if (data.estabelecimento?.ddd_fax && data.estabelecimento?.fax) {
              telefonesArray.push({
                ddd: data.estabelecimento.ddd_fax,
                numero: data.estabelecimento.fax,
                is_fax: true
              });
            }
            
            // API MinhaReceita
            if (data.ddd_telefone_1 && data.telefone_1) {
              telefonesArray.push({
                ddd: data.ddd_telefone_1,
                numero: data.telefone_1,
                is_fax: false
              });
            }
            if (data.ddd_telefone_2 && data.telefone_2) {
              telefonesArray.push({
                ddd: data.ddd_telefone_2,
                numero: data.telefone_2,
                is_fax: false
              });
            }
            if (data.ddd_fax && data.fax) {
              telefonesArray.push({
                ddd: data.ddd_fax,
                numero: data.fax,
                is_fax: true
              });
            }
            
            // API ReceitaWS - CAMPO ESPECÍFICO
            if (data.telefone) {
              const tel = data.telefone.toString();
              // Formato: "(38) 9856-6015"
              const cleanedTel = tel.replace(/\D/g, '');
              if (cleanedTel.length >= 10) {
                telefonesArray.push({
                  ddd: cleanedTel.substring(0, 2),
                  numero: cleanedTel.substring(2),
                  is_fax: false
                });
              }
            }
            
            // Formato alternativo (telefone junto com DDD)
            if (data.telefone1 && !data.ddd1) {
              const tel = data.telefone1.toString();
              if (tel.length >= 10) {
                telefonesArray.push({
                  ddd: tel.substring(0, 2),
                  numero: tel.substring(2),
                  is_fax: false
                });
              }
            }
            
            // API MinhaReceita formato DDD+Telefone junto
            if (data.ddd_telefone_1 && !data.telefone_1) {
              const tel = data.ddd_telefone_1.toString();
              if (tel.length >= 10) {
                telefonesArray.push({
                  ddd: tel.substring(0, 2),
                  numero: tel.substring(2),
                  is_fax: false
                });
              }
            }
            
            return telefonesArray.filter(t => t.ddd && t.numero);
          })(),
          
          // EMAIL - MAPEAMENTO COMPLETO
          email: data.email || data.estabelecimento?.email || data.email || null,
          
          // Informações fiscais
          opcao_simples: data.opcao_simples || data.simples?.simples === 'Sim' || data.opcao_pelo_simples ? 'S' : 'N',
          data_opcao_simples: data.data_opcao_simples || data.simples?.data_opcao_simples || data.data_opcao_pelo_simples,
          opcao_mei: data.opcao_mei || data.simples?.mei === 'Sim' || data.opcao_pelo_mei ? 'S' : 'N',
          data_opcao_mei: data.data_opcao_mei || data.simples?.data_opcao_mei || data.data_opcao_pelo_mei,
          
          // Quadro societário (QSA) - MAPEAMENTO COMPLETO
          quadro_societario: data.QSA || data.socios || data.qsa?.map((socio: any) => ({
            nome: socio.nome || socio.nome_socio,
            documento: socio.cpf_cnpj_socio || socio.documento || socio.cnpj_cpf_do_socio,
            tipo: socio.identificador_socio === 'Pessoa Física' || socio.tipo === 'Pessoa Física' || socio.identificador_de_socio === 2 ? 'PF' : 'PJ',
            qualificacao: socio.qualificacao_socio?.descricao || socio.qualificacao_socio || socio.qualificacao || socio.qualificacao_socio,
            data_entrada: socio.data_entrada_sociedade || socio.data_entrada,
            faixa_etaria: socio.faixa_etaria || socio.descricao_faixa_etaria
          })) || [],
          
          // Metadata da API usada
          _api_info: {
            fonte: api.name,
            url: api.url,
            timestamp: new Date().toISOString()
          }
        };
        
        return NextResponse.json(mappedData);
      }
      
      if (response.status === 404) {
        console.log(`❌ CNPJ não encontrado em ${api.name}`);
        lastError = new Error(`CNPJ não encontrado em ${api.name}`);
        continue; // Tenta próxima API
      }
      
      if (response.status === 429) {
        console.log(`⏱️ Rate limit em ${api.name}, tentando próxima...`);
        lastError = new Error(`Rate limit excedido em ${api.name}`);
        continue; // Tenta próxima API
      }
      
      console.log(`❌ Erro ${response.status} em ${api.name}`);
      lastError = new Error(`Erro ${response.status} em ${api.name}`);
      
    } catch (err) {
      console.log(`💥 Falha ao conectar com ${api.name}:`, err);
      lastError = err as Error;
      continue; // Tenta próxima API
    }
  }

  // Se todas as APIs falharam, retorna erro consolidado
  console.error('❌ Todas as APIs falharam');
  return NextResponse.json(
    { 
      error: 'Todas as APIs de CNPJ estão indisponíveis no momento. Tente novamente em alguns minutos.',
      detalhes: lastError?.message,
      alternativas: apis.map(api => api.name).join(', ')
    },
    { status: 500 }
  );
}