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
        :root {
          --primary: #2c3e50;
          --secondary: #3498db;
          --success: #27ae60;
          --danger: #e74c3c;
          --warning: #f39c12;
          --light: #ecf0f1;
          --dark: #2c3e50;
          --text: #333;
          --text-light: #7f8c8d;
          --border: #ddd;
          --shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          line-height: 1.6;
          color: var(--text);
          background-color: #f5f7fa;
          padding: 20px;
        }

        .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 0 15px;
        }

        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid var(--primary);
        }

        .header h1 {
          color: var(--primary);
          font-size: 2.5rem;
          margin-bottom: 5px;
        }

        .subtitle {
          color: var(--text-light);
          font-size: 1.1rem;
          font-style: italic;
        }

        .card {
          background: white;
          border-radius: 10px;
          box-shadow: var(--shadow);
          padding: 25px;
          margin-bottom: 30px;
        }

        .card h2 {
          color: var(--primary);
          margin-bottom: 20px;
          font-size: 1.5rem;
          border-bottom: 1px solid var(--border);
          padding-bottom: 10px;
        }

        .form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 20px;
          margin-bottom: 20px;
        }

        .input-group {
          display: flex;
          gap: 10px;
        }

        .input-group input {
          flex: 1;
        }

        .form-group {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        label {
          font-weight: 600;
          color: var(--dark);
          font-size: 0.9rem;
        }

        input, select {
          padding: 12px 15px;
          border: 1px solid var(--border);
          border-radius: 6px;
          font-size: 1rem;
          transition: all 0.3s ease;
        }

        input:focus, select:focus {
          outline: none;
          border-color: var(--secondary);
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
        }

        input[type="number"] {
          appearance: textfield;
        }

        input[readonly] {
          background-color: #f9f9f9;
          cursor: not-allowed;
        }

        button {
          padding: 12px 20px;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: inline-flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .primary-btn {
          background-color: var(--primary);
          color: white;
        }

        .primary-btn:hover:not(:disabled) {
          background-color: #1a252f;
          transform: translateY(-1px);
        }

        .secondary-btn {
          background-color: var(--light);
          color: var(--dark);
        }

        .secondary-btn:hover:not(:disabled) {
          background-color: #d5dbdb;
        }

        .submit-btn {
          background-color: var(--success);
          color: white;
          align-self: flex-end;
          padding: 14px 25px;
          font-size: 1.1rem;
        }

        .submit-btn:hover:not(:disabled) {
          background-color: #219955;
          transform: translateY(-1px);
          box-shadow: 0 2px 10px rgba(39, 174, 96, 0.3);
        }

        .message {
          padding: 15px;
          border-radius: 6px;
          margin-bottom: 20px;
          font-weight: 500;
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .message.success {
          background-color: rgba(39, 174, 96, 0.1);
          color: var(--success);
          border-left: 4px solid var(--success);
        }

        .message.error {
          background-color: rgba(231, 76, 60, 0.1);
          color: var(--danger);
          border-left: 4px solid var(--danger);
        }

        .livro-info {
          background-color: rgba(52, 152, 219, 0.05);
          border-radius: 8px;
          padding: 20px;
          margin-top: 20px;
          border-left: 4px solid var(--secondary);
        }

        .livro-info h3 {
          color: var(--primary);
          margin-bottom: 15px;
          font-size: 1.2rem;
        }

        .livro-details p {
          margin-bottom: 8px;
          display: flex;
          gap: 5px;
        }

        .livro-details span {
          font-weight: 600;
          min-width: 120px;
          display: inline-block;
        }

        .status {
          padding: 3px 8px;
          border-radius: 4px;
          font-size: 0.85rem;
          display: inline-flex;
        }

        .status.disponível {
          background-color: rgba(39, 174, 96, 0.1);
          color: var(--success);
        }

        .status.emprestado {
          background-color: rgba(231, 76, 60, 0.1);
          color: var(--danger);
        }

        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(0, 0, 0, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(2px);
        }

        .modal {
          background-color: white;
          border-radius: 10px;
          padding: 25px;
          width: 100%;
          max-width: 450px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
          animation: modalFadeIn 0.3s ease;
        }

        .modal h3 {
          color: var(--primary);
          margin-bottom: 15px;
        }

        .modal p {
          margin-bottom: 20px;
          color: var(--text-light);
        }

        .password-input {
          width: 100%;
          padding: 12px 15px;
          border: 1px solid var(--border);
          border-radius: 6px;
          margin-bottom: 20px;
          font-size: 1rem;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: translateY(-20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @media (max-width: 768px) {
          .container {
            padding: 0 10px;
          }
          
          .header h1 {
            font-size: 2rem;
          }
          
          .card {
            padding: 20px;
          }
          
          .form-grid {
            grid-template-columns: 1fr;
          }
          
          .input-group {
            flex-direction: column;
          }
          
          .submit-btn {
            width: 100%;
          }
        }

        @media (max-width: 480px) {
          .header h1 {
            font-size: 1.8rem;
          }
          
          .modal {
            padding: 20px;
            margin: 0 15px;
          }
        }
      `}</style>
    </div>
  );
}