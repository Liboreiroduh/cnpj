'use client';

import { useState } from 'react';

interface CNPJData {
  cnpj?: string;
  razao_social?: string;
  nome_fantasia?: string;
  capital_social?: number;
  data_inicio_atividade?: string;
  situacao_cadastral?: {
    situacao?: string;
    data_situacao?: string;
    motivo?: string;
  };
  _api_info?: {
    fonte?: string;
    url?: string;
    timestamp?: string;
  };
}

export default function ConsultaCNPJ() {
  const [cnpjInput, setCnpjInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<CNPJData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const formatCNPJ = (value: string) => {
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length <= 2) {
      return cleaned;
    } else if (cleaned.length <= 5) {
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2)}`;
    } else if (cleaned.length <= 8) {
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5)}`;
    } else if (cleaned.length <= 12) {
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8)}`;
    } else {
      return `${cleaned.slice(0, 2)}.${cleaned.slice(2, 5)}.${cleaned.slice(5, 8)}/${cleaned.slice(8, 12)}-${cleaned.slice(12, 14)}`;
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = value.replace(/\D/g, '');
    
    // Formata enquanto digita, mas permite qualquer formato
    if (cleaned.length > 0) {
      setCnpjInput(formatCNPJ(cleaned));
    } else {
      setCnpjInput(value);
    }
  };

  const clearInput = () => {
    setCnpjInput('');
    setError(null);
    setData(null);
  };

  const handleSearch = async () => {
    // Pega apenas os números do input
    const cleanedCnpj = cnpjInput.replace(/\D/g, '');
    
    console.log('Input original:', cnpjInput);
    console.log('CNPJ limpo:', cleanedCnpj);
    console.log('Tamanho:', cleanedCnpj.length);
    
    if (cleanedCnpj.length !== 14) {
      setError(`CNPJ inválido. Tem ${cleanedCnpj.length} dígitos, precisa de 14.`);
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      console.log('Fazendo consulta para CNPJ:', cleanedCnpj);
      const response = await fetch(`/api/cnpj-multi?cnpj=${cleanedCnpj}`);
      console.log('Status da resposta:', response.status);
      
      const result = await response.json();
      console.log('Resposta da API:', result);

      if (!response.ok) {
        setError(result.error || 'Erro ao consultar CNPJ');
        return;
      }

      setData(result);
    } catch (err) {
      console.error('Erro na consulta:', err);
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  // Verifica se tem 14 números para habilitar o botão
  const cleanedCnpj = cnpjInput.replace(/\D/g, '');
  const canSearch = cleanedCnpj.length === 14 && !loading;

  const formatCurrency = (value?: number) => {
    if (!value) return 'Não informado';
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'Não informada';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('pt-BR');
    } catch {
      return dateString;
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#f8fafc', 
      padding: '1rem',
      fontFamily: 'Arial, sans-serif'
    }}>
      <div style={{ maxWidth: '800px', margin: '0 auto' }}>
        {/* Cabeçalho */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <h1 style={{ 
            fontSize: '2rem', 
            fontWeight: 'bold', 
            color: '#1e293b',
            marginBottom: '0.5rem'
          }}>
            Consulta CNPJ Multi-API
          </h1>
          <p style={{ color: '#64748b', fontSize: '1rem' }}>
            Dados públicos via múltiplas APIs com bypass automático
          </p>
        </div>

        {/* Campo de Consulta */}
        <div style={{ 
          backgroundColor: 'white', 
          borderRadius: '8px', 
          padding: '1.5rem', 
          marginBottom: '2rem', 
          border: '1px solid #e2e8f0',
          boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)'
        }}>
          <div style={{ marginBottom: '1rem' }}>
            <input
              type="text"
              placeholder="Digite o CNPJ: 45.259.906/0001-63"
              value={cnpjInput}
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
              style={{ 
                width: '100%',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem',
                marginBottom: '0.75rem'
              }}
              maxLength={18}
            />
            <div style={{ fontSize: '0.875rem', marginBottom: '0.5rem' }}>
              Dígitos: {cleanedCnpj.length}/14 
              {cleanedCnpj.length === 14 && (
                <span style={{ color: '#16a34a', fontWeight: 'bold' }}> ✅ CNPJ válido!</span>
              )}
              {cleanedCnpj.length > 0 && cleanedCnpj.length < 14 && (
                <span style={{ color: '#dc2626' }}> ❌ Faltam {14 - cleanedCnpj.length} dígitos</span>
              )}
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
            <button 
              onClick={handleSearch} 
              disabled={!canSearch}
              style={{ 
                flex: 1,
                padding: '0.75rem',
                backgroundColor: canSearch ? '#3b82f6' : '#9ca3af',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: 'bold',
                cursor: canSearch ? 'pointer' : 'not-allowed'
              }}
            >
              {loading ? 'Consultando...' : 'Consultar CNPJ'}
            </button>
            
            <button 
              onClick={clearInput}
              disabled={loading}
              style={{ 
                padding: '0.75rem 1.5rem',
                backgroundColor: loading ? '#f3f4f6' : 'white',
                color: loading ? '#9ca3af' : '#374151',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: loading ? 'not-allowed' : 'pointer'
              }}
            >
              Limpar
            </button>
          </div>
          
          <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
            Digite o CNPJ em qualquer formato. O sistema vai formatar e validar automaticamente.
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            <strong>Teste:</strong> 45259906000163 | 45.259.906/0001-63 | 23246139000115
          </div>
        </div>

        {/* Mensagens de Erro */}
        {error && (
          <div style={{ 
            marginBottom: '2rem', 
            backgroundColor: '#fef2f2', 
            border: '1px solid #fecaca',
            borderRadius: '8px',
            padding: '1rem',
            color: '#991b1b'
          }}>
            <strong>Erro:</strong> {error}
          </div>
        )}

        {/* Resultados */}
        {data && (
          <div style={{ 
            backgroundColor: 'white',
            borderRadius: '8px', 
            padding: '1.5rem', 
            marginBottom: '2rem', 
            border: '1px solid #e2e8f0'
          }}>
            <h2 style={{ 
              fontSize: '1.25rem', 
              fontWeight: 'bold', 
              color: '#1e293b',
              marginBottom: '1rem',
              paddingBottom: '0.5rem',
              borderBottom: '1px solid #e2e8f0'
            }}>
              📋 Dados da Empresa
            </h2>
            
            {data.razao_social && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Razão Social:</strong><br />
                <span style={{ color: '#374151' }}>{data.razao_social}</span>
              </div>
            )}
            
            {data.nome_fantasia && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Nome Fantasia:</strong><br />
                <span style={{ color: '#374151' }}>{data.nome_fantasia}</span>
              </div>
            )}
            
            {data.cnpj && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>CNPJ:</strong><br />
                <span style={{ color: '#374151' }}>{formatCNPJ(data.cnpj)}</span>
              </div>
            )}
            
            {data.data_inicio_atividade && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Data de Abertura:</strong><br />
                <span style={{ color: '#374151' }}>{formatDate(data.data_inicio_atividade)}</span>
              </div>
            )}
            
            {data.capital_social !== undefined && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Capital Social:</strong><br />
                <span style={{ color: '#374151' }}>{formatCurrency(data.capital_social)}</span>
              </div>
            )}
            
            {data.situacao_cadastral && data.situacao_cadastral.situacao && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Situação Cadastral:</strong><br />
                <span style={{ 
                  backgroundColor: data.situacao_cadastral.situacao.includes('ATIVA') ? '#dcfce7' : '#fef2f2',
                  color: data.situacao_cadastral.situacao.includes('ATIVA') ? '#166534' : '#991b1b',
                  padding: '0.25rem 0.75rem',
                  borderRadius: '4px',
                  fontSize: '0.875rem',
                  fontWeight: '500'
                }}>
                  {data.situacao_cadastral.situacao}
                </span>
              </div>
            )}
            
            {data._api_info && (
              <div style={{ 
                marginTop: '1.5rem',
                padding: '0.75rem',
                backgroundColor: '#f0f9ff',
                border: '1px solid #bae6fd',
                borderRadius: '6px',
                fontSize: '0.875rem',
                color: '#0c4a6e'
              }}>
                <strong>Fonte:</strong> {data._api_info.fonte}<br />
                <strong>Consultado em:</strong> {new Date(data._api_info.timestamp).toLocaleString('pt-BR')}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}