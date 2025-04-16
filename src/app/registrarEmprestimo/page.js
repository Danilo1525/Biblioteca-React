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
  const [minDate, setMinDate] = useState("");

  useEffect(() => {
    // Define a data mínima como hoje no formato YYYY-MM-DD
    const today = new Date();
    const formattedDate = today.toISOString().split('T')[0];
    setMinDate(formattedDate);
  }, []);

  const validateDate = (e) => {
    const selectedDate = new Date(e.target.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      setMessage({ text: "Não é possível selecionar datas passadas", type: "error" });
      setFormData(prev => ({ ...prev, data_devolucao: "" }));
    } else {
      handleChange(e);
      setMessage({ text: "", type: "" }); // Limpa mensagens de erro
    }
  };

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
    
    // Validações básicas
    if (!formData.tombo_emprestimo || !formData.quantidade_emprestimo || 
        !formData.tipo_pessoa || !formData.data_devolucao) {
      setMessage({ text: "Por favor, preencha todos os campos obrigatórios", type: "error" });
      return;
    }

    if (formData.tipo_pessoa === "aluno" && (!formData.nome_estudante || !formData.serie_estudante)) {
      setMessage({ text: "Para alunos, é necessário informar o nome e a série", type: "error" });
      return;
    }

    if (formData.tipo_pessoa === "professor" && !formData.nome_professor) {
      setMessage({ text: "Para professores, é necessário informar o nome", type: "error" });
      return;
    }

    if (!livroInfo) {
      setMessage({ text: "Por favor, busque o livro primeiro", type: "error" });
      return;
    }

    // Mostra o modal de senha em vez de processar diretamente
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
        // Limpa o formulário após sucesso
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
      <h1>Registrar Empréstimo</h1>
      
      {message.text && (
        <div className={`message ${message.type}`}>
          {message.text}
        </div>
      )}

      <div className="section">
        <h2>Buscar Livro</h2>
        <form onSubmit={handleBuscarLivro} className="search-form">
          <input
            type="number"
            id="buscar_tombo"
            min="1"
            onChange={validateNumber}
            placeholder="Número do Tombo"
            value={formData.buscar_tombo}
            disabled={loading}
          />
          <button type="submit" disabled={loading}>
            {loading ? "Buscando..." : "Buscar"}
          </button>
        </form>
        
        {livroInfo && (
          <div className="livro-info">
            <h3>Informações do Livro:</h3>
            <p><strong>Título:</strong> {livroInfo.titulo}</p>
            <p><strong>Autor:</strong> {livroInfo.autor}</p>
            <p><strong>Tombo:</strong> {livroInfo.numeroTombo}</p>
            <p><strong>Status:</strong> {livroInfo.status}</p>
            {livroInfo.status === 'Emprestado' && (
              <p><strong>Emprestado para:</strong> {livroInfo.destinatario}</p>
            )}
          </div>
        )}
      </div>

      <div className="section">
        <h2>Dados do Empréstimo</h2>
        <form onSubmit={handleEmprestarLivro} className="emprestimo-form">
          <div className="form-group">
            <label htmlFor="tombo_emprestimo">Tombo do Livro:</label>
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
            <label htmlFor="quantidade_emprestimo">Quantidade:</label>
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
            <label htmlFor="tipo_pessoa">Tipo de Pessoa:</label>
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

          {showAlunoFields && (
            <div className="form-group">
              <label htmlFor="nome_estudante">Nome do Aluno:</label>
              <input
                type="text"
                id="nome_estudante"
                value={formData.nome_estudante}
                onChange={handleChange}
                required={showAlunoFields}
                disabled={loading}
              />
            </div>
          )}

          {showAlunoFields && (
            <div className="form-group">
              <label htmlFor="serie_estudante">Série:</label>
              <select
                id="serie_estudante"
                value={formData.serie_estudante}
                onChange={handleChange}
                required={showAlunoFields}
                disabled={loading}
              >
                <option value="" disabled>Selecione a série</option>
                <optgroup label="Ensino Fundamental">
                  <option value="6_matutino">6º Ano - Matutino</option>
                  <option value="6_vespertino">6º Ano - Vespertino</option>
                  <option value="6_integral">6º Ano - Integral</option>
                  <option value="7_matutino">7º Ano - Matutino</option>
                  <option value="7_vespertino">7º Ano - Vespertino</option>
                  <option value="7_integral">7º Ano - Integral</option>
                  <option value="8_matutino">8º Ano - Matutino</option>
                  <option value="8_vespertino">8º Ano - Vespertino</option>
                  <option value="8_integral">8º Ano - Integral</option>
                  <option value="9_matutino">9º Ano - Matutino</option>
                  <option value="9_vespertino">9º Ano - Vespertino</option>
                  <option value="9_integral">9º Ano - Integral</option>
                </optgroup>
                <optgroup label="Ensino Médio">
                  <option value="1_vespertino">1º Ano - Vespertino</option>
                  <option value="1_integral">1º Ano - Integral</option>
                  <option value="2_vespertino">2º Ano - Vespertino</option>
                  <option value="2_integral">2º Ano - Integral</option>
                  <option value="3_vespertino">3º Ano - Vespertino</option>
                  <option value="3_integral">3º Ano - Integral</option>
                </optgroup>
              </select>
            </div>
          )}

          {showAlunoFields && (
            <div className="form-group">
              <label htmlFor="turma">Turma:</label>
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
          )}

          {showProfessorFields && (
            <div className="form-group">
              <label htmlFor="nome_professor">Nome do Professor:</label>
              <input
                type="text"
                id="nome_professor"
                value={formData.nome_professor}
                onChange={handleChange}
                required={showProfessorFields}
                disabled={loading}
              />
            </div>
          )}

<div className="form-group">
        <label htmlFor="data_devolucao">Data de Devolução:</label>
        <input
          type="date"
          id="data_devolucao"
          value={formData.data_devolucao}
          onChange={validateDate}
          required
          disabled={loading}
          min={minDate}
        />
        {formData.data_devolucao && new Date(formData.data_devolucao) < new Date() && (
          <p className="date-error">Data inválida! Selecione uma data futura.</p>
        )}
      </div>

          <button type="submit" disabled={loading || !livroInfo} className="submit-btn">
            {loading ? "Processando..." : "Registrar Empréstimo"}
          </button>
        </form>
      </div>

      {/* Modal de confirmação de senha */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal">
            <h3>Confirmação de Empréstimo</h3>
            <p>Digite a senha de administrador para confirmar:</p>
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
          max-width: 800px;
          margin: 0 auto;
          padding: 20px;
        }
        
        .section {
          margin-bottom: 30px;
          padding: 20px;
          background: #f9f9f9;
          border-radius: 8px;
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
        
        .form-group {
          margin-bottom: 15px;
        }
        
        label {
          display: block;
          margin-bottom: 5px;
          font-weight: bold;
        }
        input:invalid {
  border-color: #dc3545;
}

.date-error {
  color: #dc3545;
  font-size: 0.8rem;
  margin-top: 5px;
}
        input, select {
          width: 100%;
          padding: 8px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }
        
        .search-form, .emprestimo-form {
          display: flex;
          flex-direction: column;
          gap: 15px;
        }
        
        button {
          padding: 10px 15px;
          background-color: #0070f3;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
        }
        
        button:disabled {
          background-color: #ccc;
          cursor: not-allowed;
        }
        
        .submit-btn {
          margin-top: 10px;
          background-color: #28a745;
        }
        
        .livro-info {
          margin-top: 15px;
          padding: 10px;
          background: #e9ecef;
          border-radius: 4px;
        }

        /* Estilos do modal */
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
          padding: 20px;
          border-radius: 8px;
          width: 90%;
          max-width: 400px;
        }

        .modal h3 {
          margin-top: 0;
          color: #333;
        }

        .modal p {
          margin-bottom: 15px;
        }

        .password-input {
          width: 100%;
          padding: 10px;
          margin-bottom: 15px;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .modal-actions {
          display: flex;
          justify-content: flex-end;
          gap: 10px;
        }

        .primary-btn {
          background-color: #28a745;
        }

        .secondary-btn {
          background-color: #6c757d;
        }
      `}</style>
    </div>
  );
}