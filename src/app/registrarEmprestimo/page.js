"use client";
import { useState } from "react";

export default function RegistrarEmprestimoPage() {
  const [formData, setFormData] = useState({
    buscar_tombo: "",
    tombo_emprestimo: "",
    quantidade_emprestimo: 1,
    tipo_pessoa: "",
    nome_estudante: "",
    serie_estudante: "",
    turma: "",
    nome_professor: "",
    data_devolucao: "",
  });

  const [livroInfo, setLivroInfo] = useState(null);
  const [showAlunoFields, setShowAlunoFields] = useState(false);
  const [showProfessorFields, setShowProfessorFields] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [password, setPassword] = useState("");

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleTipoPessoaChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, tipo_pessoa: value }));
    setShowAlunoFields(value === "aluno");
    setShowProfessorFields(value === "professor");
  };

  const validateNumber = (e) => {
    if (e.target.value < 0) e.target.value = 1;
    handleChange(e);
  };

  const handleBuscarLivro = async (e) => {
    e.preventDefault();
    if (!formData.buscar_tombo) {
      setMessage({ text: "Por favor, informe o número do tombo", type: "error" });
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/livros?tombo=${formData.buscar_tombo}`);
      const data = await response.json();

      if (response.ok) {
        setLivroInfo(data);
        setFormData(prev => ({ ...prev, tombo_emprestimo: formData.buscar_tombo }));
        setMessage({ text: "Livro encontrado!", type: "success" });
      } else {
        throw new Error(data.error || "Livro não encontrado");
      }
    } catch (error) {
      setLivroInfo(null);
      setMessage({ text: error.message, type: "error" });
    } finally {
      setLoading(false);
    }
  };

  const handleEmprestarLivro = async (e) => {
    e.preventDefault();
    setShowPasswordModal(true);
  };

  const confirmarEmprestimo = async () => {
    if (password !== "bibliotecaeepjd") {
      setMessage({ text: "Senha incorreta!", type: "error" });
      setShowPasswordModal(false);
      return;
    }

    setShowPasswordModal(false);
    setLoading(true);
    
    try {
      const emprestimoData = {
        livroId: livroInfo.id,
        quantidade: parseInt(formData.quantidade_emprestimo),
        tipoPessoa: formData.tipo_pessoa,
        nomePessoa: formData.tipo_pessoa === "aluno" ? formData.nome_estudante : formData.nome_professor,
        serie: formData.serie_estudante,
        turma: formData.turma,
        dataDevolucao: formData.data_devolucao
      };

      const response = await fetch('/api/emprestimos', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emprestimoData)
      });

      const data = await response.json();

      if (response.ok) {
        setMessage({ 
          text: `Livro "${livroInfo.titulo}" emprestado com sucesso para ${emprestimoData.nomePessoa}!`, 
          type: "success" 
        });
        setFormData({
          buscar_tombo: "",
          tombo_emprestimo: "",
          quantidade_emprestimo: 1,
          tipo_pessoa: "",
          nome_estudante: "",
          serie_estudante: "",
          turma: "",
          nome_professor: "",
          data_devolucao: "",
        });
        setLivroInfo(null);
      } else {
        throw new Error(data.error || "Erro ao registrar empréstimo");
      }
    } catch (error) {
      setMessage({ text: error.message, type: "error" });
    } finally {
      setLoading(false);
      setPassword("");
    }
  };

  return (
    <div className="container">
      <header className="header">
        <h1>Biblioteca Online</h1>
        <p className="subtitle">Biblioteca Escola Estadual Padre José Daniel</p>
      </header>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="card">
        <h2>Buscar Livro</h2>
        <form onSubmit={handleBuscarLivro} className="form">
          <div className="input-group">
            <input
              type="number"
              id="buscar_tombo"
              min="1"
              onChange={validateNumber}
              placeholder="Número do Tombo"
              value={formData.buscar_tombo}
              disabled={loading}
            />
            <button type="submit" disabled={loading} className="primary-btn">
              {loading ? "Buscando..." : "Buscar Livro"}
            </button>
          </div>
        </form>
        
        {livroInfo && (
          <div className="livro-info">
            <h3>Informações do Livro</h3>
            <div className="livro-details">
              <p><span>Título:</span> {livroInfo.titulo}</p>
              <p><span>Autor:</span> {livroInfo.autor}</p>
              <p><span>Tombo:</span> {livroInfo.numeroTombo}</p>
              <p className={`status ${livroInfo.status.toLowerCase()}`}>
                <span>Status:</span> {livroInfo.status}
              </p>
              {livroInfo.status === 'Emprestado' && (
                <p><span>Emprestado para:</span> {livroInfo.destinatario}</p>
              )}
            </div>
          </div>
        )}
      </div>

      <div className="card">
        <h2>Dados do Empréstimo</h2>
        <form onSubmit={handleEmprestarLivro} className="form">
          <div className="form-grid">
            <div className="form-group">
              <label htmlFor="tombo_emprestimo">Tombo do Livro</label>
              <input
                type="text"
                id="tombo_emprestimo"
                value={formData.tombo_emprestimo}
                onChange={handleChange}
                required
                readOnly
              />
            </div>

            <div className="form-group">
              <label htmlFor="quantidade_emprestimo">Quantidade</label>
              <input
                type="number"
                id="quantidade_emprestimo"
                min="1"
                onChange={validateNumber}
                value={formData.quantidade_emprestimo}
                required
                disabled={loading}
              />
            </div>

            <div className="form-group">
              <label htmlFor="tipo_pessoa">Tipo de Pessoa</label>
              <select
                id="tipo_pessoa"
                onChange={handleTipoPessoaChange}
                value={formData.tipo_pessoa}
                required
                disabled={loading}
              >
                <option value="" disabled>Selecione o tipo</option>
                <option value="aluno">Aluno</option>
                <option value="professor">Professor</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="data_devolucao">Data de Devolução</label>
              <input
                type="date"
                id="data_devolucao"
                value={formData.data_devolucao}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          </div>

          {showAlunoFields && (
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="nome_estudante">Nome do Aluno</label>
                <input
                  type="text"
                  id="nome_estudante"
                  value={formData.nome_estudante}
                  onChange={handleChange}
                  required
                  disabled={loading}
                />
              </div>

              <div className="form-group">
                <label htmlFor="serie_estudante">Série</label>
                <select
                  id="serie_estudante"
                  value={formData.serie_estudante}
                  onChange={handleChange}
                  required
                  disabled={loading}
                >
                  <option value="" disabled>Selecione a série</option>
                  <optgroup label="Ensino Fundamental">
                    <option value="6_matutino">6º Ano - Matutino</option>
                    <option value="6_vespertino">6º Ano - Vespertino</option>
                    <option value="6_integral">6º Ano - Integral</option>
                  </optgroup>
                  <optgroup label="Ensino Médio">
                    <option value="1_vespertino">1º Ano - Vespertino</option>
                    <option value="1_integral">1º Ano - Integral</option>
                  </optgroup>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="turma">Turma</label>
                <select
                  id="turma"
                  value={formData.turma}
                  onChange={handleChange}
                  disabled={loading}
                >
                  <option value="" disabled>Selecione a turma</option>
                  <option value="A">A</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              </div>
            </div>
          )}

          {showProfessorFields && (
            <div className="form-group">
              <label htmlFor="nome_professor">Nome do Professor</label>
              <input
                type="text"
                id="nome_professor"
                value={formData.nome_professor}
                onChange={handleChange}
                required
                disabled={loading}
              />
            </div>
          )}

          <button 
            type="submit" 
            disabled={loading || !livroInfo} 
            className="submit-btn"
          >
            {loading ? "Processando..." : "Registrar Empréstimo"}
          </button>
        </form>
      </div>

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirmação de Empréstimo</h3>
            <p>Digite a senha de administrador para confirmar o empréstimo:</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha"
              className="password-input"
            />
            <div className="modal-actions">
              <button 
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword("");
                }}
                className="secondary-btn"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarEmprestimo}
                className="primary-btn"
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
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem;
          font-family: 'Segoe UI', system-ui, sans-serif;
        }

        /* Inputs */
        .full-width-input {
          width: 100%;
          padding: 0.8rem 1rem;
          font-size: 1rem;
          border: 2px solid #d1d5db;
          border-radius: 0.5rem;
          transition: all 0.2s;
        }

        .full-width-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.2);
          outline: none;
        }

        /* Grupo de Input */
        .input-group {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1.5rem;
        }

        /* Botões */
        .action-btn {
          padding: 0.8rem 1.5rem;
          background-color: #3b82f6;
          color: white;
          border: none;
          border-radius: 0.5rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
          white-space: nowrap;
        }

        .action-btn:hover {
          background-color: #2563eb;
        }

        .action-btn:disabled {
          background-color: #9ca3af;
          cursor: not-allowed;
        }

        /* Card de Informações */
        .book-info-card {
          background: #f9fafb;
          border-radius: 0.5rem;
          padding: 1.5rem;
          margin-top: 1rem;
          border-left: 4px solid #3b82f6;
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
        }

        .book-details p {
          margin: 0.5rem 0;
          line-height: 1.6;
        }

        .detail-label {
          font-weight: 600;
          color: #4b5563;
          display: inline-block;
          min-width: 120px;
        }

        /* Status */
        .status {
          padding: 0.2rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.9rem;
        }

        .status.disponível {
          background-color: #dcfce7;
          color: #166534;
        }

        .status.emprestado {
          background-color: #fee2e2;
          color: #991b1b;
        }

        /* Responsividade */
        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }

          .input-group {
            flex-direction: column;
          }

          .action-btn {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}