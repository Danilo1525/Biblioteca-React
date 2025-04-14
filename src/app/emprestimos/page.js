"use client";
import { useState, useEffect } from 'react';

export default function EmprestimosPage() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ativos');
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    const carregarDados = async () => {
      try {
        setLoading(true);
        const [ativosResponse, historicoResponse] = await Promise.all([
          fetch('/api/listaEmprestimos?tipo=ativos'),
          fetch('/api/listaEmprestimos?tipo=historico')
        ]);
        
        const ativosData = await ativosResponse.json();
        const historicoData = await historicoResponse.json();
        
        if (ativosResponse.ok && historicoResponse.ok) {
          setEmprestimos(ativosData);
          setHistorico(historicoData);
        } else {
          throw new Error('Erro ao carregar dados');
        }
      } catch (error) {
        setMessage({ text: error.message, type: 'error' });
      } finally {
        setLoading(false);
      }
    };
    
    carregarDados();
  }, []);

  const handleConfirmarDevolucao = async (id) => {
    try {
      const response = await fetch('/api/listaEmprestimos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id })
      });

      const data = await response.json();
      
      if (response.ok) {
        setEmprestimos(prev => prev.filter(emp => emp.id !== id));
        setHistorico(prev => [data, ...prev]);
        setMessage({ text: 'Devolução confirmada com sucesso!', type: 'success' });
      } else {
        throw new Error(data.error || 'Erro ao confirmar devolução');
      }
    } catch (error) {
      setMessage({ text: error.message, type: 'error' });
    }
  };

  const formatarData = (dataString) => {
    try {
      const options = { day: '2-digit', month: '2-digit', year: 'numeric' };
      return new Date(dataString).toLocaleDateString('pt-BR', options);
    } catch {
      return 'Data inválida';
    }
  };

  const renderLinhaEmprestimo = (emp) => {
    const estaAtrasado = !emp.devolvido && new Date() > new Date(emp.dataDevolucao);
    const statusClass = emp.devolvido ? 'devolvido' : estaAtrasado ? 'atrasado' : '';
    
    return (
      <tr key={emp.id} className={statusClass}>
        <td>
          {emp.devolvido 
            ? '✔️ Devolvido' 
            : estaAtrasado 
              ? '❌ Atrasado' 
              : '⏳ Em andamento'}
        </td>
        <td>{emp.livro?.numeroTombo || 'N/A'}</td>
        <td>
          {emp.livro?.titulo || 'Livro não encontrado'} 
          (QTD: {emp.quantidade || 1})
        </td>
        <td>
          {emp.nomePessoa || 'N/A'}
          {emp.turma && ` - Turma: ${emp.turma}`}
          {emp.serie && ` (${emp.serie})`}
        </td>
        <td>{formatarData(emp.dataEmprestimo)}</td>
        <td>{formatarData(emp.dataDevolucao)}</td>
        <td>
          {!emp.devolvido && (
            <button
              onClick={() => handleConfirmarDevolucao(emp.id)}
              className="btn-confirmar"
              disabled={loading}
            >
              ✔️ Confirmar
            </button>
          )}
        </td>
      </tr>
    );
    
  };

  return (
    <div className="container emprestimos-container">
      <h2>Gerenciamento de Empréstimos</h2>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="tabs">
        <button 
          className={activeTab === 'ativos' ? 'active' : ''}
          onClick={() => setActiveTab('ativos')}
        >
          Empréstimos Ativos
        </button>
        <button 
          className={activeTab === 'historico' ? 'active' : ''}
          onClick={() => setActiveTab('historico')}
        >
          Histórico (Últimos 50)
        </button>
      </div>

      {loading ? (
        <p>Carregando...</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Status</th>
              <th>Tombo</th>
              <th>Título (QTD)</th>
              <th>Aluno/Professor</th>
              <th>Data Empréstimo</th>
              <th>Data Devolução</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {activeTab === 'ativos' 
              ? emprestimos.map(renderLinhaEmprestimo)
              : historico.map(renderLinhaEmprestimo)}
          </tbody>
        </table>
      )}
    </div>
  );
}