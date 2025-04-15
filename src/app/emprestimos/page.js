"use client";
import { useState, useEffect } from 'react';

export default function EmprestimosPage() {
  const [emprestimos, setEmprestimos] = useState([]);
  const [historico, setHistorico] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ativos');
  const [message, setMessage] = useState({ text: '', type: '' });
  const [emprestimoParaDeletar, setEmprestimoParaDeletar] = useState(null);
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState('');
  const [actionType, setActionType] = useState(''); // 'devolucao' ou 'exclusao'
  const [emprestimoParaAcao, setEmprestimoParaAcao] = useState(null);

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

  const verificarSenha = () => {
    return password === "bibliotecaeepjd"; // Senha padrão
  };

  const handleConfirmarDevolucao = (id) => {
    const emprestimo = emprestimos.find(emp => emp.id === id);
    setEmprestimoParaAcao(emprestimo);
    setActionType('devolucao');
    setShowPasswordModal(true);
  };

  const handleExcluirEmprestimo = (emprestimo) => {
    setEmprestimoParaAcao(emprestimo);
    setActionType('exclusao');
    setShowPasswordModal(true);
  };

  const confirmarAcao = async () => {
    if (!verificarSenha()) {
      setMessage({ text: 'Senha incorreta!', type: 'error' });
      setShowPasswordModal(false);
      return;
    }

    setShowPasswordModal(false);
    setLoading(true);

    try {
      if (actionType === 'devolucao') {
        const response = await fetch('/api/listaEmprestimos', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: emprestimoParaAcao.id })
        });

        const data = await response.json();
        
        if (response.ok) {
          setEmprestimos(prev => prev.filter(emp => emp.id !== emprestimoParaAcao.id));
          setHistorico(prev => [data, ...prev]);
          setMessage({ text: 'Devolução confirmada com sucesso!', type: 'success' });
        } else {
          throw new Error(data.error || 'Erro ao confirmar devolução');
        }
      } else if (actionType === 'exclusao') {
        const response = await fetch('/api/listaEmprestimos', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ id: emprestimoParaAcao.id })
        });

        const textResponse = await response.text();
        const data = textResponse ? JSON.parse(textResponse) : {};
        
        if (!response.ok) {
          throw new Error(data.error || `Erro ${response.status}`);
        }

        if (activeTab === 'ativos') {
          setEmprestimos(prev => prev.filter(emp => emp.id !== emprestimoParaAcao.id));
        } else {
          setHistorico(prev => prev.filter(emp => emp.id !== emprestimoParaAcao.id));
        }
        setMessage({ text: 'Empréstimo excluído com sucesso!', type: 'success' });
      }
    } catch (error) {
      setMessage({ 
        text: error.message || `Erro ao ${actionType === 'devolucao' ? 'confirmar devolução' : 'excluir empréstimo'}`, 
        type: 'error' 
      });
    } finally {
      setLoading(false);
      setPassword('');
      setEmprestimoParaAcao(null);
      setEmprestimoParaDeletar(null);
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
          <button
            onClick={() => handleExcluirEmprestimo(emp)}
            className="btn-excluir"
            disabled={loading}
          >
            🗑️ Excluir
          </button>
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

      {/* Modal de Confirmação de Exclusão */}
      {emprestimoParaDeletar && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirmar Exclusão</h3>
            <p>
              Tem certeza que deseja excluir permanentemente o empréstimo do livro:
              <br />
              <strong>{emprestimoParaDeletar.livro?.titulo || 'Livro não encontrado'}</strong>
              <br />
              para <strong>{emprestimoParaDeletar.nomePessoa}</strong>?
            </p>
            <div className="modal-buttons">
              <button 
                onClick={() => setEmprestimoParaDeletar(null)}
                className="btn-cancelar"
              >
                Cancelar
              </button>
              <button 
                onClick={() => {
                  setActionType('exclusao');
                  setShowPasswordModal(true);
                }}
                className="btn-confirmar-exclusao"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de Senha */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Verificação de Segurança</h3>
            <p>Digite a senha de administrador para confirmar a ação:</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha"
              className="password-input"
              autoFocus
            />
            <div className="modal-buttons">
              <button 
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword('');
                  setEmprestimoParaDeletar(null);
                }}
                className="btn-cancelar"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarAcao}
                className="btn-confirmar-exclusao"
                disabled={!password}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f5f7fa; /* Fundo cinza claro */
  }
        
        .tabs {
    display: flex;
    margin-bottom: 20px;
    border-bottom: 1px solid #ddd;
  }
        
        .tabs button {
          padding: 10px 20px;
          border: none;
          border-bottom: 3px solid transparent;
          cursor: pointer;
          font-size: 16px;
        }
        
        .tabs button.active {
          border-bottom-color: #4361ee;
          font-weight: bold;
        }
        
        table {
          width: 100%;
          border-collapse: collapse;
          margin-top: 20px;
        }
        
        th, td {
          padding: 12px 15px;
          text-align: left;
          border-bottom: 1px solid #ddd;
        }
        
        th {
          background-color: #f8f9fa;
          font-weight: bold;
        }
        
        tr:hover {
          background-color: #f5f5f5;
        }
        
        .devolvido {
          background-color: #e6f7e6;
        }
        
        .atrasado {
          background-color: #ffebee;
        }
        
        .btn-confirmar, .btn-excluir {
          padding: 5px 10px;
          margin-right: 5px;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .btn-confirmar {
          background-color: #28a745;
          color: white;
        }
        
        .btn-excluir {
          background-color: #dc3545;
          color: white;
        }
        
        .message {
          padding: 10px 15px;
          margin-bottom: 20px;
          border-radius: 4px;
        }
        
        .message.success {
          background-color: #d4edda;
          color: #155724;
        }
        
        .message.error {
          background-color: #f8d7da;
          color: #721c24;
        }
        
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal {
          background: white;
          padding: 25px;
          border-radius: 8px;
          width: 90%;
          max-width: 500px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .modal h3 {
          margin-top: 0;
          color: #333;
        }
        
        .modal p {
          margin-bottom: 20px;
          line-height: 1.5;
        }
        
        .password-input {
          width: 100%;
          padding: 10px;
          margin-bottom: 20px;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 16px;
        }
        
        .modal-buttons {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }
        
        .btn-cancelar {
          padding: 8px 16px;
          background-color: #6c757d;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        .btn-confirmar-exclusao {
          padding: 8px 16px;
          background-color: #dc3545;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
          .emprestimos-container {
    background-color: white; /* Fundo branco para a área do conteúdo */
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  }
        
        @media (max-width: 768px) {
          table {
            display: block;
            overflow-x: auto;
          }
          
          .modal {
            width: 95%;
            padding: 15px;
          }
        }
      `}</style>
    </div>
  );
}