'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Search, Building2, Phone, Mail, Users, Briefcase, AlertCircle, CheckCircle, RefreshCw, Globe, Shield, Key } from 'lucide-react';

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
      <div style={{ maxWidth: '1200px', margin: '0 auto', space: '1.5rem' }}>
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
        <Card style={{ marginBottom: '2rem', border: '1px solid #e2e8f0' }}>
          <CardContent style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
              <Input
                placeholder="Digite apenas números: 45259906000163"
                value={cnpjInput}
                onChange={handleInputChange}
                onBlur={handleInputBlur}
                onKeyPress={handleKeyPress}
                style={{ flex: 1 }}
                maxLength={18}
              />
              <Button 
                onClick={handleSearch} 
                disabled={loading || cnpjInput.replace(/\D/g, '').length !== 14}
                style={{ minWidth: '120px' }}
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
                    <Search style={{ width: '16px', height: '16px', marginRight: '8px' }} />
                    Consultar
                  </>
                )}
              </Button>
              <Button 
                variant="outline"
                onClick={clearInput}
                disabled={loading}
                style={{ minWidth: '80px' }}
              >
                Limpar
              </Button>
            </div>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>
              Digite apenas os 14 números do CNPJ. O sistema formatará automaticamente.
            </div>
            <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>
              <strong>🧪 Teste Rate Limit:</strong> 45259906000163 | <strong>✅ Funcionais:</strong> 23246139000115 | 04259026000110 | 33592510000154
            </div>
          </CardContent>
        </Card>

        {/* Cards de Informação */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
          gap: '1rem',
          marginBottom: '2rem'
        }}>
          <Card style={{ backgroundColor: '#eff6ff', border: '1px solid #bfdbfe' }}>
            <CardContent style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <RefreshCw style={{ width: '16px', height: '16px', color: '#1d4ed8' }} />
                <h3 style={{ fontWeight: '600', color: '#1e40af', margin: 0 }}>Rotação Automática</h3>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#1e40af' }}>
                4 APIs diferentes com fallback inteligente
              </p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0' }}>
            <CardContent style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Shield style={{ width: '16px', height: '16px', color: '#16a34a' }} />
                <h3 style={{ fontWeight: '600', color: '#15803d', margin: 0 }}>Bypass 429</h3>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#15803d' }}>
                Contorna automaticamente limites de requisição
              </p>
            </CardContent>
          </Card>

          <Card style={{ backgroundColor: '#faf5ff', border: '1px solid #e9d5ff' }}>
            <CardContent style={{ padding: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Key style={{ width: '16px', height: '16px', color: '#7c3aed' }} />
                <h3 style={{ fontWeight: '600', color: '#6d28d9', margin: 0 }}>Multi-Identidade</h3>
              </div>
              <p style={{ fontSize: '0.875rem', color: '#6d28d9' }}>
                User-Agents e headers variados
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Mensagens de Erro */}
        {error && (
          <Alert style={{ marginBottom: '2rem', backgroundColor: '#fef2f2', border: '1px solid #fecaca' }}>
            <AlertCircle style={{ width: '16px', height: '16px', color: '#dc2626' }} />
            <AlertDescription style={{ color: '#991b1b' }}>
              {error}
              {error.includes('Limite de consultas') && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.875rem' }}>
                  💡 <strong>Dica:</strong> O sistema tentará múltiplas APIs automaticamente. 
                  Se todas falharem, aguarde alguns minutos.
                </div>
              )}
            </AlertDescription>
          </Alert>
        )}

        {/* Info da API usada */}
        {data && data._api_info && (
          <Alert style={{ marginBottom: '2rem', backgroundColor: '#f0f9ff', border: '1px solid #bae6fd' }}>
            <Globe style={{ width: '16px', height: '16px', color: '#0284c7' }} />
            <AlertDescription style={{ color: '#0c4a6e' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <strong>Fonte:</strong> {data._api_info.fonte}
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '0.25rem' }}>
                    Consultado em: {new Date(data._api_info.timestamp).toLocaleString('pt-BR')}
                  </div>
                </div>
                <Badge variant="outline" style={{ fontSize: '0.75rem' }}>
                  🚀 Multi-API Ativa
                </Badge>
              </div>
            </AlertDescription>
          </Alert>
        )}

        {/* Resultados */}
        {data && (
          <div style={{ space: '1.5rem' }}>
            {/* DADOS GERAIS */}
            {(data.razao_social || data.nome_fantasia || data.cnpj) && (
              <Card style={{ marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                <CardHeader>
                  <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Building2 style={{ width: '20px', height: '20px' }} />
                    Dados Gerais
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ space: '1rem' }}>
                  {data.razao_social && (
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontWeight: '600', color: '#374151' }}>Razão Social:</span>
                      <p style={{ color: '#111827', margin: '0.25rem 0' }}>{data.razao_social}</p>
                    </div>
                  )}
                  {data.nome_fantasia && (
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontWeight: '600', color: '#374151' }}>Nome Fantasia:</span>
                      <p style={{ color: '#111827', margin: '0.25rem 0' }}>{data.nome_fantasia}</p>
                    </div>
                  )}
                  {data.cnpj && (
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontWeight: '600', color: '#374151' }}>CNPJ:</span>
                      <p style={{ color: '#111827', margin: '0.25rem 0' }}>{formatCNPJ(data.cnpj)}</p>
                    </div>
                  )}
                  {data.data_inicio_atividade && (
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontWeight: '600', color: '#374151' }}>Data de Abertura:</span>
                      <p style={{ color: '#111827', margin: '0.25rem 0' }}>{formatDate(data.data_inicio_atividade)}</p>
                    </div>
                  )}
                  {data.capital_social !== undefined && (
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontWeight: '600', color: '#374151' }}>Capital Social:</span>
                      <p style={{ color: '#111827', margin: '0.25rem 0' }}>{formatCurrency(data.capital_social)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* SITUAÇÃO CADASTRAL */}
            {data.situacao_cadastral && data.situacao_cadastral.situacao && (
              <Card style={{ marginBottom: '1.5rem', border: '1px solid #e2e8f0' }}>
                <CardHeader>
                  <CardTitle style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <CheckCircle style={{ width: '20px', height: '20px' }} />
                    Situação Cadastral
                  </CardTitle>
                </CardHeader>
                <CardContent style={{ space: '1rem' }}>
                  <div style={{ marginBottom: '1rem' }}>
                    <span style={{ fontWeight: '600', color: '#374151' }}>Situação:</span>
                    <Badge 
                      variant={data.situacao_cadastral.situacao.includes('ATIVA') ? 'default' : 'destructive'}
                      style={{ marginLeft: '0.5rem' }}
                    >
                      {data.situacao_cadastral.situacao}
                    </Badge>
                  </div>
                  {data.situacao_cadastral.data_situacao && (
                    <div style={{ marginBottom: '1rem' }}>
                      <span style={{ fontWeight: '600', color: '#374151' }}>Data da Situação:</span>
                      <p style={{ color: '#111827', margin: '0.25rem 0' }}>{formatDate(data.situacao_cadastral.data_situacao)}</p>
                    </div>
                  )}
                </CardContent>
              </Card>
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