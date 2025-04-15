"use client";
import { useState } from "react";

export default function RegistrarEmprestimoPage() {
  // ... (mantenha todos os estados existentes)

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordInput, setPasswordInput] = useState("");

  // ... (mantenha todas as funções existentes)

  const handleEmprestarLivro = async (e) => {
    e.preventDefault();
    
    // Mostra o modal de senha primeiro
    setShowPasswordModal(true);
  };

  const confirmarComSenha = async () => {
    if (passwordInput !== "bibliotecaeepjd") {
      setMessage({ text: "Senha incorreta!", type: "error" });
      setShowPasswordModal(false);
      return;
    }

    setShowPasswordModal(false);
    setLoading(true);
    
    try {
      // Restante da lógica de empréstimo (igual à sua função original)
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
    }
  };

  return (
    <div className="container">
      {/* ... (mantenha todo o conteúdo existente) */}
      
      {/* Modal de Confirmação com Senha */}
      {showPasswordModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>Confirmação de Empréstimo</h3>
            <p>Digite a senha de administrador para confirmar:</p>
            <input
              type="password"
              value={passwordInput}
              onChange={(e) => setPasswordInput(e.target.value)}
              placeholder="Digite a senha"
              className="password-input"
            />
            <div className="modal-buttons">
              <button 
                onClick={() => setShowPasswordModal(false)}
                className="cancel-btn"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmarComSenha}
                className="confirm-btn"
                disabled={loading}
              >
                {loading ? "Verificando..." : "Confirmar"}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .container {
          max-width: 800px;
          margin: 2rem auto;
          padding: 2rem;
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        
        h1 {
          color: #2c3e50;
          text-align: center;
          margin-bottom: 2rem;
          font-size: 2rem;
        }
        
        h2 {
          color: #3498db;
          margin-bottom: 1rem;
          font-size: 1.5rem;
          border-bottom: 2px solid #eee;
          padding-bottom: 0.5rem;
        }
        
        .section {
          margin-bottom: 2rem;
          padding: 1.5rem;
          background: #f8fafc;
          border-radius: 10px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        
        .message {
          padding: 1rem;
          margin-bottom: 1.5rem;
          border-radius: 8px;
          font-weight: 500;
          text-align: center;
        }
        
        .message.success {
          background-color: #d1fae5;
          color: #065f46;
          border: 1px solid #a7f3d0;
        }
        
        .message.error {
          background-color: #fee2e2;
          color: #b91c1c;
          border: 1px solid #fca5a5;
        }
        
        .form-group {
          margin-bottom: 1.25rem;
        }
        
        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 600;
          color: #4b5563;
        }
        
        input, select {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #d1d5db;
          border-radius: 8px;
          font-size: 1rem;
          transition: border-color 0.3s;
        }
        
        input:focus, select:focus {
          outline: none;
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
        }
        
        .search-form, .emprestimo-form {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }
        
        button {
          padding: 0.75rem 1.5rem;
          font-weight: 600;
          border-radius: 8px;
          cursor: pointer;
          transition: all 0.2s;
          font-size: 1rem;
        }
        
        button:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }
        
        .submit-btn {
          margin-top: 1rem;
          background-color: #10b981;
          color: white;
          border: none;
        }
        
        .submit-btn:hover:not(:disabled) {
          background-color: #059669;
        }
        
        .livro-info {
          margin-top: 1.5rem;
          padding: 1rem;
          background: #e0e7ff;
          border-radius: 8px;
          color: #1e40af;
          border-left: 4px solid #3b82f6;
        }
        
        .livro-info p {
          margin: 0.5rem 0;
        }
        
        /* Modal Styles */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 1000;
        }
        
        .modal-content {
          background: white;
          padding: 2rem;
          border-radius: 12px;
          width: 90%;
          max-width: 400px;
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }
        
        .modal-content h3 {
          margin-top: 0;
          color: #1e40af;
        }
        
        .password-input {
          width: 100%;
          padding: 0.75rem;
          margin: 1rem 0;
          border: 2px solid #e2e8f0;
          border-radius: 8px;
          font-size: 1rem;
        }
        
        .modal-buttons {
          display: flex;
          gap: 1rem;
          justify-content: flex-end;
        }
        
        .cancel-btn {
          background: #f1f5f9;
          color: #64748b;
          border: none;
        }
        
        .cancel-btn:hover {
          background: #e2e8f0;
        }
        
        .confirm-btn {
          background: #3b82f6;
          color: white;
          border: none;
        }
        
        .confirm-btn:hover:not(:disabled) {
          background: #2563eb;
        }
        
        @media (max-width: 640px) {
          .container {
            padding: 1rem;
          }
          
          .section {
            padding: 1rem;
          }
        }
      `}</style>
    </div>
  );
}