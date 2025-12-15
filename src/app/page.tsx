'use client';

import { useState } from 'react';
import { Search, Building2, CheckCircle, RefreshCw, Shield, Key, Globe, AlertCircle } from 'lucide-react';

interface CNPJData {
  cnpj?: string;
  razao_social?: string;
  nome_fantasia?: string;
  capital_social?: number;
  data_inicio_atividade?: string;
  matriz_filial?: string;
  natureza_juridica?: {
    descricao?: string;
  };
  porte?: string;
  logradouro?: string;
  numero?: string;
  complemento?: string;
  bairro?: string;
  municipio?: string;
  uf?: string;
  cep?: string;
  telefones?: Array<{
    ddd?: string;
    numero?: string;
  }>;
  email?: string;
  situacao_cadastral?: {
    situacao?: string;
    data_situacao?: string;
    motivo?: string;
  };
  cnae_principal?: {
    codigo?: string;
    descricao?: string;
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
    let value = e.target.value;
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length > 0) {
      value = formatCNPJ(cleaned);
    }
    
    setCnpjInput(value);
  };

  const handleInputBlur = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    const cleaned = value.replace(/\D/g, '');
    
    if (cleaned.length === 14) {
      setCnpjInput(formatCNPJ(cleaned));
    } else if (cleaned.length > 0) {
      setCnpjInput(cleaned);
    } else {
      setCnpjInput('');
    }
  };

  const clearInput = () => {
    setCnpjInput('');
    setError(null);
    setData(null);
  };

  const handleSearch = async () => {
    const cleanedCnpj = cnpjInput.replace(/\D/g, '');
    
    if (cleanedCnpj.length !== 14) {
      setError('CNPJ inválido. Deve conter 14 dígitos.');
      return;
    }

    setLoading(true);
    setError(null);
    setData(null);

    try {
      const response = await fetch(`/api/cnpj-multi?cnpj=${cleanedCnpj}`);
      const result = await response.json();

      if (!response.ok) {
        setError(result.error || 'Erro ao consultar CNPJ');
        return;
      }

      setData(result);
    } catch (err) {
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
      fontFamily: 'Inter, system-ui, sans-serif'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
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
          <p style={{ color: '#64748b', fontSize: '1.1rem' }}>
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
          <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
            <input
              type="text"
              placeholder="Digite apenas números: 45259906000163"
              value={cnpjInput}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              onKeyPress={handleKeyPress}
              style={{ 
                flex: 1, 
                minWidth: '200px',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '6px',
                fontSize: '1rem'
              }}
              maxLength={18}
            />
            <button 
              onClick={handleSearch} 
              disabled={loading || cnpjInput.replace(/\D/g, '').length !== 14}
              style={{ 
                minWidth: '120px',
                padding: '0.75rem 1.5rem',
                backgroundColor: (loading || cnpjInput.replace(/\D/g, '').length !== 14) ? '#9ca3af' : '#3b82f6',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                fontSize: '1rem',
                fontWeight: '500',
                cursor: (loading || cnpjInput.replace(/\D/g, '').length !== 14) ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem'
              }}
            >
              {loading ? (
                <div style={{ 
                  width: '16px', 
                  height: '16px', 
                  border: '2px solid white', 
                  borderTop: '2px solid transparent',
                  borderRadius: '50%',
                  animation: 'spin 1s linear infinite'
                }}></div>
              ) : (
                <>
                  <Search style={{ width: '16px', height: '16px' }} />
                  Consultar
                </>
              )}
            </button>
            <button 
              onClick={clearInput}
              disabled={loading}
              style={{ 
                minWidth: '80px',
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
            Digite apenas os 14 números do CNPJ. O sistema formatará automaticamente.
          </div>
          <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
            <strong>🧪 Teste Rate Limit:</strong> 45259906000163 | <strong>✅ Funcionais:</strong> 23246139000115 | 04259026000110 | 33592510000154
          </div>
        </div>

        {/* Cards de Informação */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <div style={{ 
            backgroundColor: '#eff6ff', 
            border: '1px solid #bfdbfe',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <RefreshCw style={{ width: '16px', height: '16px', color: '#1d4ed8' }} />
              <h3 style={{ fontWeight: '600', color: '#1e40af', margin: 0 }}>Rotação Automática</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#1e40af', margin: 0 }}>
              4 APIs diferentes com fallback inteligente
            </p>
          </div>

          <div style={{ 
            backgroundColor: '#f0fdf4', 
            border: '1px solid #bbf7d0',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Shield style={{ width: '16px', height: '16px', color: '#16a34a' }} />
              <h3 style={{ fontWeight: '600', color: '#15803d', margin: 0 }}>Bypass 429</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#15803d', margin: 0 }}>
              Contorna automaticamente limites de requisição
            </p>
          </div>

          <div style={{ 
            backgroundColor: '#faf5ff', 
            border: '1px solid #e9d5ff',
            borderRadius: '8px',
            padding: '1rem'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <Key style={{ width: '16px', height: '16px', color: '#7c3aed' }} />
              <h3 style={{ fontWeight: '600', color: '#6d28d9', margin: 0 }}>Multi-Identidade</h3>
            </div>
            <p style={{ fontSize: '0.875rem', color: '#6d28d9', margin: 0 }}>
              User-Agents e headers variados
            </p>
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
            display: 'flex',
            alignItems: 'flex-start',
            gap: '0.75rem'
          }}>
            <AlertCircle style={{ width: '16px', height: '16px', color: '#dc2626', flexShrink: 0, marginTop: '0.125rem' }} />
            <div>
              <div style={{ color: '#991b1b', fontWeight: '500' }}>
                {error}
              </div>
              {error.includes('Limite de consultas') && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: '#991b1b' }}>
                  💡 <strong>Dica:</strong> O sistema tentará múltiplas APIs automaticamente. 
                  Se todas falharem, aguarde alguns minutos.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Info da API usada */}
        {data && data._api_info && (
          <div style={{ 
            marginBottom: '2rem', 
            backgroundColor: '#f0f9ff', 
            border: '1px solid #bae6fd',
            borderRadius: '8px',
            padding: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.75rem'
          }}>
            <Globe style={{ width: '16px', height: '16px', color: '#0284c7', flexShrink: 0 }} />
            <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ color: '#0c4a6e', fontWeight: '500' }}>
                  <strong>Fonte:</strong> {data._api_info.fonte}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                  Consultado em: {new Date(data._api_info.timestamp).toLocaleString('pt-BR')}
                </div>
              </div>
              <div style={{ 
                fontSize: '0.75rem', 
                backgroundColor: '#e0f2fe', 
                color: '#0c4a6e', 
                padding: '0.25rem 0.75rem', 
                borderRadius: '9999px',
                fontWeight: '500'
              }}>
                🚀 Multi-API Ativa
              </div>
            </div>
          </div>
        )}

        {/* Resultados */}
        {data && (
          <div style={{ space: '1.5rem' }}>
            {/* DADOS GERAIS */}
            {(data.razao_social || data.nome_fantasia || data.cnpj) && (
              <div style={{ 
                marginBottom: '1.5rem', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: 'white',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  backgroundColor: '#f8fafc', 
                  padding: '1rem 1.5rem', 
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <Building2 style={{ width: '20px', height: '20px', color: '#374151' }} />
                  <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
                    Dados Gerais
                  </h2>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  {data.razao_social && (
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontWeight: '600', color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                        Razão Social:
                      </span>
                      <p style={{ color: '#111827', margin: 0 }}>{data.razao_social}</p>
                    </div>
                  )}
                  {data.nome_fantasia && (
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontWeight: '600', color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                        Nome Fantasia:
                      </span>
                      <p style={{ color: '#111827', margin: 0 }}>{data.nome_fantasia}</p>
                    </div>
                  )}
                  {data.cnpj && (
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontWeight: '600', color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                        CNPJ:
                      </span>
                      <p style={{ color: '#111827', margin: 0 }}>{formatCNPJ(data.cnpj)}</p>
                    </div>
                  )}
                  {data.data_inicio_atividade && (
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontWeight: '600', color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                        Data de Abertura:
                      </span>
                      <p style={{ color: '#111827', margin: 0 }}>{formatDate(data.data_inicio_atividade)}</p>
                    </div>
                  )}
                  {data.capital_social !== undefined && (
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontWeight: '600', color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                        Capital Social:
                      </span>
                      <p style={{ color: '#111827', margin: 0 }}>{formatCurrency(data.capital_social)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* SITUAÇÃO CADASTRAL */}
            {data.situacao_cadastral && data.situacao_cadastral.situacao && (
              <div style={{ 
                marginBottom: '1.5rem', 
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                backgroundColor: 'white',
                overflow: 'hidden'
              }}>
                <div style={{ 
                  backgroundColor: '#f8fafc', 
                  padding: '1rem 1.5rem', 
                  borderBottom: '1px solid #e2e8f0',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  <CheckCircle style={{ width: '20px', height: '20px', color: '#374151' }} />
                  <h2 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600', color: '#111827' }}>
                    Situação Cadastral
                  </h2>
                </div>
                <div style={{ padding: '1.5rem' }}>
                  <div style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontWeight: '600', color: '#374151' }}>Situação:</span>
                    <div style={{ 
                      backgroundColor: data.situacao_cadastral.situacao.includes('ATIVA') ? '#dcfce7' : '#fef2f2',
                      color: data.situacao_cadastral.situacao.includes('ATIVA') ? '#166534' : '#991b1b',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '9999px',
                      fontSize: '0.875rem',
                      fontWeight: '500'
                    }}>
                      {data.situacao_cadastral.situacao}
                    </div>
                  </div>
                  {data.situacao_cadastral.data_situacao && (
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontWeight: '600', color: '#374151', display: 'block', marginBottom: '0.25rem' }}>
                        Data da Situação:
                      </span>
                      <p style={{ color: '#111827', margin: 0 }}>{formatDate(data.situacao_cadastral.data_situacao)}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}