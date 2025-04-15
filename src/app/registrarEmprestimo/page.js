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

      <div className="form-container">
        <div className="form-section">
          <h2>Buscar Livro</h2>
          <form onSubmit={handleBuscarLivro} className="search-form">
            <div className="input-group">
              <input
                type="number"
                id="buscar_tombo"
                min="1"
                placeholder="Digite o número do tombo"
                value={formData.buscar_tombo}
                onChange={validateNumber}
                disabled={loading}
              />
              <button type="submit" disabled={loading}>
                {loading ? "Buscando..." : "Buscar"}
              </button>
            </div>
          </form>
        </div>

        <div className="form-section">
          <h2>Dados do Empréstimo</h2>
          <form onSubmit={handleEmprestarLivro} className="loan-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tombo_emprestimo">Tombo do Livro</label>
                <input
                  type="text"
                  id="tombo_emprestimo"
                  value={formData.tombo_emprestimo}
                  readOnly
                />
              </div>

              <div className="form-group">
                <label htmlFor="quantidade_emprestimo">Quantidade</label>
                <input
                  type="number"
                  id="quantidade_emprestimo"
                  min="1"
                  value={formData.quantidade_emprestimo}
                  onChange={validateNumber}
                  disabled={loading}
                />
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="tipo_pessoa">Tipo de Pessoa</label>
                <select
                  id="tipo_pessoa"
                  value={formData.tipo_pessoa}
                  onChange={handleTipoPessoaChange}
                  disabled={loading}
                >
                  <option value="">Selecione o tipo</option>
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
                  disabled={loading}
                />
              </div>
            </div>

            {/* Campos condicionais para aluno/professor */}
            {showAlunoFields && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nome_estudante">Nome do Aluno</label>
                  <input
                    type="text"
                    id="nome_estudante"
                    value={formData.nome_estudante}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="serie_estudante">Série</label>
                  <select
                    id="serie_estudante"
                    value={formData.serie_estudante}
                    onChange={handleChange}
                    disabled={loading}
                  >
                    <option value="">Selecione a série</option>
                    {/* Opções mantidas como no original */}
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
                    <option value="">Selecione a turma</option>
                    <option value="A">A</option>
                    <option value="B">B</option>
                    <option value="C">C</option>
                  </select>
                </div>
              </div>
            )}

            {showProfessorFields && (
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="nome_professor">Nome do Professor</label>
                  <input
                    type="text"
                    id="nome_professor"
                    value={formData.nome_professor}
                    onChange={handleChange}
                    disabled={loading}
                  />
                </div>
              </div>
            )}

            <button type="submit" className="submit-btn" disabled={loading || !livroInfo}>
              Registrar Empréstimo
            </button>
          </form>
        </div>
      </div>

      <style jsx>{`
        .container {
          max-width: 1000px;
          margin: 0 auto;
          padding: 20px;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }

        .header {
          text-align: center;
          margin-bottom: 30px;
        }

        .header h1 {
          color: #2c3e50;
          font-size: 2.2rem;
          margin-bottom: 5px;
        }

        .subtitle {
          color: #7f8c8d;
          font-style: italic;
          font-size: 1.1rem;
        }

        .form-container {
          background: white;
          border-radius: 10px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
          padding: 25px;
        }

        .form-section {
          margin-bottom: 30px;
        }

        h2 {
          color: #3498db;
          margin-bottom: 20px;
          font-size: 1.5rem;
          border-bottom: 1px solid #eee;
          padding-bottom: 10px;
        }

        .form-row {
          display: flex;
          gap: 20px;
          margin-bottom: 20px;
          flex-wrap: wrap;
        }

        .form-group {
          flex: 1;
          min-width: 200px;
        }

        label {
          display: block;
          margin-bottom: 8px;
          font-weight: 600;
          color: #2c3e50;
          font-size: 0.95rem;
        }

        input, select {
          width: 100%;
          padding: 12px;
          border: 1px solid #ddd;
          border-radius: 6px;
          font-size: 1rem;
          transition: border-color 0.3s;
        }

        input:focus, select:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 2px rgba(52, 152, 219, 0.2);
        }

        input[type="number"] {
          -moz-appearance: textfield;
        }

        input[readonly] {
          background-color: #f9f9f9;
        }

        .input-group {
          display: flex;
          gap: 10px;
        }

        .input-group input {
          flex: 1;
        }

        button {
          padding: 12px 20px;
          background-color: #3498db;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 1rem;
          font-weight: 600;
          cursor: pointer;
          transition: background-color 0.3s;
        }

        button:hover:not(:disabled) {
          background-color: #2980b9;
        }

        button:disabled {
          background-color: #95a5a6;
          cursor: not-allowed;
        }

        .submit-btn {
          background-color: #27ae60;
          width: 100%;
          max-width: 300px;
          margin: 20px auto 0;
          display: block;
        }

        .submit-btn:hover:not(:disabled) {
          background-color: #219955;
        }

        @media (max-width: 768px) {
          .form-row {
            flex-direction: column;
            gap: 15px;
          }

          .form-group {
            min-width: 100%;
          }

          .input-group {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}