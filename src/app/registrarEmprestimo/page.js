"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RegistrarEmprestimoPage() {
  const router = useRouter();
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
  const [today, setToday] = useState("");

  // Configura a data mínima para o datepicker (hoje + 1 dia)
  useEffect(() => {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    setToday(tomorrow.toISOString().split('T')[0]);
    setFormData(prev => ({
      ...prev,
      data_devolucao: tomorrow.toISOString().split('T')[0]
    }));
  }, []);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({ ...prev, [id]: value }));
  };

  const handleTipoPessoaChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({ 
      ...prev, 
      tipo_pessoa: value,
      nome_estudante: value === "aluno" ? prev.nome_estudante : "",
      nome_professor: value === "professor" ? prev.nome_professor : "",
      serie_estudante: value === "aluno" ? prev.serie_estudante : "",
      turma: value === "aluno" ? prev.turma : ""
    }));
    setShowAlunoFields(value === "aluno");
    setShowProfessorFields(value === "professor");
  };

  const validateNumber = (e) => {
    const value = Math.max(1, parseInt(e.target.value) || 1);
    handleChange({
      target: {
        id: e.target.id,
        value: value
      }
    });
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
        setFormData(prev => ({ 
          ...prev, 
          tombo_emprestimo: formData.buscar_tombo,
          quantidade_emprestimo: 1
        }));
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
    
    // Validações antes de mostrar o modal
    if (!livroInfo) {
      setMessage({ text: "Por favor, busque um livro válido primeiro", type: "error" });
      return;
    }
    
    if (!formData.tipo_pessoa) {
      setMessage({ text: "Por favor, selecione o tipo de pessoa", type: "error" });
      return;
    }
    
    if (formData.tipo_pessoa === "aluno" && !formData.nome_estudante) {
      setMessage({ text: "Por favor, informe o nome do aluno", type: "error" });
      return;
    }
    
    if (formData.tipo_pessoa === "professor" && !formData.nome_professor) {
      setMessage({ text: "Por favor, informe o nome do professor", type: "error" });
      return;
    }
    
    if (!formData.data_devolucao) {
      setMessage({ text: "Por favor, selecione a data de devolução", type: "error" });
      return;
    }

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
        
        // Reset form
        setFormData({
          buscar_tombo: "",
          tombo_emprestimo: "",
          quantidade_emprestimo: 1,
          tipo_pessoa: "",
          nome_estudante: "",
          serie_estudante: "",
          turma: "",
          nome_professor: "",
          data_devolucao: today,
        });
        
        setLivroInfo(null);
        setShowAlunoFields(false);
        setShowProfessorFields(false);
        
        // Auto-close success message after 5 seconds
        setTimeout(() => {
          setMessage({ text: "", type: "" });
        }, 5000);
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

  // Efeito para auto-fechar mensagens de erro após 5 segundos
  useEffect(() => {
    if (message.type === "error") {
      const timer = setTimeout(() => {
        setMessage({ text: "", type: "" });
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [message]);

  return (
    <div className="container">
      <header className="header">
        <h1 className="title">Biblioteca Online</h1>
        <p className="subtitle">Biblioteca Escola Estadual Padre José Daniel</p>
        <button 
          onClick={() => router.push('/')} 
          className="back-button"
        >
          &larr; Voltar
        </button>
      </header>

      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
          {message.type === "success" && (
            <button 
              onClick={() => setMessage({ text: "", type: "" })} 
              className="close-message"
            >
              &times;
            </button>
          )}
        </div>
      )}

      <div className="card">
        <h2 className="card-title">Buscar Livro</h2>
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
              className="input"
            />
            <button 
              type="submit" 
              disabled={loading} 
              className={`button primary ${loading ? 'loading' : ''}`}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Buscando...
                </>
              ) : "Buscar Livro"}
            </button>
          </div>
        </form>
        
        {livroInfo && (
          <div className="livro-info">
            <h3 className="livro-info-title">Informações do Livro</h3>
            <div className="livro-details">
              <p><span className="detail-label">Título:</span> {livroInfo.titulo}</p>
              <p><span className="detail-label">Autor:</span> {livroInfo.autor}</p>
              <p><span className="detail-label">Tombo:</span> {livroInfo.numeroTombo}</p>
              <p className={`status ${livroInfo.status.toLowerCase()}`}>
                <span className="detail-label">Status:</span> {livroInfo.status}
              </p>
              {livroInfo.status === 'Emprestado' && (
                <p><span className="detail-label">Emprestado para:</span> {livroInfo.destinatario}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {livroInfo && (
        <div className="card">
          <h2 className="card-title">Dados do Empréstimo</h2>
          <form onSubmit={handleEmprestarLivro} className="form">
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="tombo_emprestimo" className="label">Tombo do Livro</label>
                <input
                  type="text"
                  id="tombo_emprestimo"
                  value={formData.tombo_emprestimo}
                  onChange={handleChange}
                  required
                  readOnly
                  className="input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="quantidade_emprestimo" className="label">Quantidade</label>
                <input
                  type="number"
                  id="quantidade_emprestimo"
                  min="1"
                  onChange={validateNumber}
                  value={formData.quantidade_emprestimo}
                  required
                  disabled={loading}
                  className="input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tipo_pessoa" className="label">Tipo de Pessoa</label>
                <select
                  id="tipo_pessoa"
                  onChange={handleTipoPessoaChange}
                  value={formData.tipo_pessoa}
                  required
                  disabled={loading}
                  className="input"
                >
                  <option value="" disabled>Selecione o tipo</option>
                  <option value="aluno">Aluno</option>
                  <option value="professor">Professor</option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="data_devolucao" className="label">Data de Devolução</label>
                <input
                  type="date"
                  id="data_devolucao"
                  value={formData.data_devolucao}
                  onChange={handleChange}
                  min={today}
                  required
                  disabled={loading}
                  className="input"
                />
              </div>
            </div>

            {showAlunoFields && (
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="nome_estudante" className="label">Nome do Aluno</label>
                  <input
                    type="text"
                    id="nome_estudante"
                    value={formData.nome_estudante}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="input"
                    placeholder="Digite o nome completo do aluno"
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="serie_estudante" className="label">Série</label>
                  <select
                    id="serie_estudante"
                    value={formData.serie_estudante}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="input"
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
                  <label htmlFor="turma" className="label">Turma</label>
                  <select
                    id="turma"
                    value={formData.turma}
                    onChange={handleChange}
                    required
                    disabled={loading}
                    className="input"
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
                <label htmlFor="nome_professor" className="label">Nome do Professor</label>
                <input
                  type="text"
                  id="nome_professor"
                  value={formData.nome_professor}
                  onChange={handleChange}
                  required
                  disabled={loading}
                  className="input"
                  placeholder="Digite o nome completo do professor"
                />
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading} 
              className={`button submit ${loading ? 'loading' : ''}`}
            >
              {loading ? (
                <>
                  <span className="spinner"></span>
                  Processando...
                </>
              ) : "Registrar Empréstimo"}
            </button>
          </form>
        </div>
      )}

      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3 className="modal-title">Confirmação de Empréstimo</h3>
            <p className="modal-text">Digite a senha de administrador para confirmar o empréstimo:</p>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a senha"
              className="input password-input"
              autoFocus
            />
            <div className="modal-actions">
              <button 
                onClick={() => {
                  setShowPasswordModal(false);
                  setPassword("");
                }}
                className="button secondary"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarEmprestimo}
                className="button primary"
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
          --primary-color: #4361ee;
          --primary-hover: #3a56d4;
          --secondary-color: #f8f9fa;
          --secondary-hover: #e9ecef;
          --success-color: #2b9348;
          --error-color: #d00000;
          --text-color: #212529;
          --light-text: #6c757d;
          --border-color: #dee2e6;
          --card-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          --transition: all 0.3s ease;
        }

        * {
          box-sizing: border-box;
          margin: 0;
          padding: 0;
        }

        body {
          font-family: 'Segoe UI', system-ui, sans-serif;
          line-height: 1.6;
          color: var(--text-color);
          background-color: #f5f7fa;
        }

        .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 2rem 1rem;
        }

        .header {
          text-align: center;
          margin-bottom: 2rem;
          position: relative;
        }

        .title {
          font-size: 2.5rem;
          color: var(--primary-color);
          margin-bottom: 0.5rem;
        }

        .subtitle {
          font-size: 1.1rem;
          color: var(--light-text);
          margin-bottom: 1rem;
        }

        .back-button {
          position: absolute;
          left: 0;
          top: 0;
          background: none;
          border: none;
          color: var(--primary-color);
          font-size: 1rem;
          cursor: pointer;
          display: flex;
          align-items: center;
          padding: 0.5rem;
          transition: var(--transition);
        }

        .back-button:hover {
          color: var(--primary-hover);
        }

        .card {
          background: white;
          border-radius: 0.75rem;
          padding: 1.5rem;
          margin-bottom: 1.5rem;
          box-shadow: var(--card-shadow);
          transition: var(--transition);
        }

        .card:hover {
          box-shadow: 0 10px 15px rgba(0, 0, 0, 0.1);
        }

        .card-title {
          font-size: 1.5rem;
          margin-bottom: 1.5rem;
          color: var(--primary-color);
          position: relative;
          padding-bottom: 0.5rem;
        }

        .card-title::after {
          content: '';
          position: absolute;
          bottom: 0;
          left: 0;
          width: 50px;
          height: 3px;
          background-color: var(--primary-color);
        }

        .form {
          width: 100%;
        }

        .input-group {
          display: flex;
          gap: 0.75rem;
          margin-bottom: 1rem;
        }

        @media (max-width: 768px) {
          .input-group {
            flex-direction: column;
          }
        }

        .form-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1rem;
          margin-bottom: 1rem;
        }

        .form-group {
          margin-bottom: 1rem;
        }

        .label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: var(--text-color);
        }

        .input {
          width: 100%;
          padding: 0.75rem 1rem;
          font-size: 1rem;
          border: 1px solid var(--border-color);
          border-radius: 0.5rem;
          transition: var(--transition);
          background-color: white;
        }

        .input:focus {
          border-color: var(--primary-color);
          outline: none;
          box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.2);
        }

        .input[readonly] {
          background-color: #f8f9fa;
          cursor: not-allowed;
        }

        .input[disabled] {
          background-color: #e9ecef;
          cursor: not-allowed;
        }

        .password-input {
          margin: 1rem 0;
        }

        .button {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          padding: 0.75rem 1.5rem;
          font-size: 1rem;
          font-weight: 500;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          transition: var(--transition);
          white-space: nowrap;
        }

        .button.primary {
          background-color: var(--primary-color);
          color: white;
        }

        .button.primary:hover {
          background-color: var(--primary-hover);
        }

        .button.primary:disabled {
          background-color: #adb5bd;
          cursor: not-allowed;
        }

        .button.secondary {
          background-color: var(--secondary-color);
          color: var(--text-color);
        }

        .button.secondary:hover {
          background-color: var(--secondary-hover);
        }

        .button.submit {
          width: 100%;
          margin-top: 1rem;
          padding: 1rem;
          font-size: 1.1rem;
        }

        .spinner {
          display: inline-block;
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top-color: white;
          animation: spin 1s ease-in-out infinite;
          margin-right: 0.5rem;
        }

        .button.secondary .spinner {
          border-top-color: var(--text-color);
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        .livro-info {
          margin-top: 1.5rem;
          padding: 1rem;
          background-color: #f8f9fa;
          border-radius: 0.5rem;
          border-left: 4px solid var(--primary-color);
        }

        .livro-info-title {
          font-size: 1.2rem;
          margin-bottom: 1rem;
          color: var(--primary-color);
        }

        .livro-details p {
          margin: 0.75rem 0;
          line-height: 1.6;
        }

        .detail-label {
          font-weight: 600;
          color: var(--text-color);
          display: inline-block;
          min-width: 120px;
        }

        .status {
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-size: 0.9rem;
          font-weight: 500;
        }

        .status.disponível {
          background-color: #d4edda;
          color: #155724;
        }

        .status.emprestado {
          background-color: #f8d7da;
          color: #721c24;
        }

        .message {
          padding: 1rem;
          margin-bottom: 1.5rem;
          border-radius: 0.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          animation: fadeIn 0.3s ease-out;
        }

        .message.success {
          background-color: #d4edda;
          color: #155724;
          border: 1px solid #c3e6cb;
        }

        .message.error {
          background-color: #f8d7da;
          color: #721c24;
          border: 1px solid #f5c6cb;
        }

        .close-message {
          background: none;
          border: none;
          color: inherit;
          font-size: 1.2rem;
          cursor: pointer;
          padding: 0 0.5rem;
        }

        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
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
          animation: fadeIn 0.3s ease-out;
        }

        .modal {
          background: white;
          border-radius: 0.75rem;
          padding: 2rem;
          width: 100%;
          max-width: 400px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .modal-title {
          font-size: 1.25rem;
          margin-bottom: 1rem;
          color: var(--primary-color);
        }

        .modal-text {
          margin-bottom: 1rem;
          color: var(--text-color);
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 1rem;
          margin-top: 1.5rem;
        }

        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }

          .title {
            font-size: 2rem;
          }

          .card {
            padding: 1rem;
          }

          .modal {
            padding: 1.5rem;
            margin: 0 1rem;
          }

          .modal-actions {
            flex-direction: column;
          }

          .modal-actions .button {
            width: 100%;
          }
        }
      `}</style>
    </div>
  );
}