"use client";
import { useState } from "react";

export default function Home() {
  const [termoBusca, setTermoBusca] = useState("");
  const [resultados, setResultados] = useState(null);
  const [loading, setLoading] = useState(false);
  const [filtros, setFiltros] = useState({
    status: 'todos',
    ordenacao: 'titulo',
    dataEmprestimo: ''
  });

  const handleBuscarLivros = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const queryParams = new URLSearchParams({
        termo: termoBusca,
        status: filtros.status,
        ordenacao: filtros.ordenacao,
        data: filtros.dataEmprestimo
      }).toString();

      const res = await fetch(`/api/livros?${queryParams}`);
      const data = await res.json();

      if (res.ok) {
        setResultados(data);
      } else {
        throw new Error(data.error || "Erro ao buscar livros");
      }
    } catch (error) {
      console.error("Erro na busca:", error);
      setResultados(null);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container">
      <div className="busca-container">
        <h1 className="titulo-principal">Biblioteca - Acervo de Livros</h1>

        <form onSubmit={handleBuscarLivros} className="form-busca">
          <div className="input-group">
            <input
              type="text"
              value={termoBusca}
              onChange={(e) => setTermoBusca(e.target.value)}
              placeholder="Digite título, autor ou tombo"
              className="campo-busca"
            />
            <div className="filtros-container">
              <select
                value={filtros.status}
                onChange={(e) => setFiltros(prev => ({...prev, status: e.target.value}))}
                className="filtro-select"
              >
                <option value="todos">Todos os Status</option>
                <option value="disponivel">Disponíveis</option>
                <option value="emprestado">Emprestados</option>
              </select>

              <select
                value={filtros.ordenacao}
                onChange={(e) => setFiltros(prev => ({...prev, ordenacao: e.target.value}))}
                className="filtro-select"
              >
                <option value="titulo">Ordenar por Título</option>
                <option value="autor">Ordenar por Autor</option>
                <option value="tombo">Ordenar por Tombo</option>
              </select>

              <input
                type="date"
                value={filtros.dataEmprestimo}
                onChange={(e) => setFiltros(prev => ({...prev, dataEmprestimo: e.target.value}))}
                className="filtro-select"
                placeholder="Filtrar por data"
              />
            </div>
            <button
              type="submit"
              disabled={loading || !termoBusca.trim()}
              className="botao-busca"
            >
              {loading ? (
                <div className="loader-container">
                  <span className="loader"></span>
                  <span>Buscando...</span>
                </div>
              ) : (
                "🔍 Buscar"
              )}
            </button>
          </div>
        </form>

        {resultados && (
          <div className="resultados-container">
            <div className="estatisticas-box">
              <h3 className="subtitulo">Estatísticas do Acervo</h3>
              <div className="dados-estatisticos">
                <div className="dado">
                  <span className="valor">{resultados.estatisticas.total}</span>
                  <span className="label">Total</span>
                </div>
                <div className="dado disponivel">
                  <span className="valor">
                    {resultados.estatisticas.disponiveis}
                  </span>
                  <span className="label">Disponíveis</span>
                </div>
                <div className="dado emprestado">
                  <span className="valor">
                    {resultados.estatisticas.emprestados}
                  </span>
                  <span className="label">Emprestados</span>
                </div>
              </div>
            </div>

            <div className="resultados-livros">
              <h3 className="subtitulo">
                Resultados:{" "}
                <span className="contador">{resultados.livros.length}</span>
              </h3>

              {resultados.livros.length === 0 ? (
                <div className="sem-resultados">
                  <p>Nenhum livro encontrado com o termo {termoBusca}</p>
                </div>
              ) : (
                <div className="grade-livros">
                  {resultados.livros.map((livro) => (
                    <div
                      key={livro.id}
                      className={`cartao-livro ${livro.status.toLowerCase()}`}
                    >
                      <div className="cabecalho-cartao">
                        <h4 className="titulo-livro">{livro.titulo}</h4>
                        <span className="status">{livro.status}</span>
                      </div>
                      <div className="corpo-cartao">
                        <p className="detalhe">
                          <span className="rotulo">Tombo:</span>
                          <span className="valor">{livro.numeroTombo}</span>
                        </p>
                        <p className="detalhe">
                          <span className="rotulo">Autor:</span>
                          <span className="valor">{livro.autor}</span>
                        </p>
                        {livro.destinatario && (
                          <p className="detalhe">
                            <span className="rotulo">Emprestado para:</span>
                            <span className="valor">{livro.destinatario}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <style jsx>{`
        .container {
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem 1rem;
          font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
        }

        .titulo-principal {
          text-align: center;
          color: #2c3e50;
          margin-bottom: 2rem;
          font-size: 2.2rem;
          font-weight: 600;
        }
        .input-group {
          display: flex;
          width: 100%;
        }

        .form-busca {
          display: flex;
          gap: 1rem;
          margin-bottom: 3rem;
          max-width: 800px;
          margin-left: auto;
          margin-right: auto;
        }

        .campo-busca {
          flex: 1;
          border-radius: 8px 0 0 8px !important; /* Borda apenas à esquerda */
          margin: 0 !important; /* Remove margens conflitantes */
        }

        .campo-busca:focus {
          outline: none;
          border-color: #3498db;
          box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.2);
        }

        .botao-busca {
          border-radius: 0 8px 8px 0 !important; /* Borda apenas à direita */
          margin: 0 !important; /* Remove margens conflitantes */
          width: auto; /* Largura automática baseada no conteúdo */
        }

        .botao-busca:hover:not(:disabled) {
          background-color: #2980b9;
        }

        .botao-busca:disabled {
          background-color: #bdc3c7;
          cursor: not-allowed;
          opacity: 0.7;
        }

        .loader {
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-radius: 50%;
          border-top: 2px solid white;
          width: 16px;
          height: 16px;
          animation: spin 1s linear infinite;
        }
        .loader-container {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }
        .botao-busca:disabled {
          opacity: 0.9; /* Mantém visível mas indica estado inativo */
        }

        .resultados-container {
          background: white;
          border-radius: 12px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          padding: 2rem;
          margin-top: 1rem;
        }

        .estatisticas-box {
          background: #f8f9fa;
          border-radius: 10px;
          padding: 1.5rem;
          margin-bottom: 2rem;
        }

        .subtitulo {
          color: #2c3e50;
          margin-bottom: 1.5rem;
          font-size: 1.5rem;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .contador {
          background: #3498db;
          color: white;
          padding: 0.2rem 0.6rem;
          border-radius: 20px;
          font-size: 1rem;
        }

        .dados-estatisticos {
          display: flex;
          gap: 1.5rem;
          justify-content: center;
        }

        .dado {
          text-align: center;
          padding: 1rem 1.5rem;
          border-radius: 8px;
          background: white;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
          min-width: 100px;
        }

        .dado.disponivel {
          border-top: 4px solid #2ecc71;
        }

        .dado.emprestado {
          border-top: 4px solid #e74c3c;
        }

        .valor {
          display: block;
          font-size: 1.8rem;
          font-weight: 700;
          color: #2c3e50;
        }

        .label {
          font-size: 0.9rem;
          color: #7f8c8d;
        }

        .grade-livros {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
          gap: 1.5rem;
          margin-top: 1.5rem;
        }

        .cartao-livro {
          background: white;
          border-radius: 10px;
          padding: 1.5rem;
          box-shadow: 0 3px 10px rgba(0, 0, 0, 0.08);
          transition: transform 0.2s, box-shadow 0.2s;
          border-left: 4px solid #3498db;
        }

        .cartao-livro:hover {
          transform: translateY(-5px);
          box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
        }

        .cartao-livro.disponível {
          border-left-color: #2ecc71;
        }

        .cartao-livro.emprestado {
          border-left-color: #e74c3c;
        }

        .cabecalho-cartao {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 1rem;
          gap: 1rem;
        }

        .titulo-livro {
          margin: 0;
          color: #2c3e50;
          font-size: 1.2rem;
          font-weight: 600;
          flex: 1;
        }

        .status {
          font-size: 0.8rem;
          padding: 0.3rem 0.6rem;
          border-radius: 12px;
          font-weight: 500;
        }

        .cartao-livro.disponível .status {
          background: #e8f5e9;
          color: #27ae60;
        }

        .cartao-livro.emprestado .status {
          background: #ffebee;
          color: #c0392b;
        }

        .corpo-cartao {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .detalhe {
          margin: 0;
          display: flex;
          gap: 0.5rem;
        }

        .rotulo {
          font-weight: 500;
          color: #7f8c8d;
          min-width: 100px;
        }

        .valor {
          color: #2c3e50;
        }

        .sem-resultados {
          text-align: center;
          padding: 2rem;
          background: #f8f9fa;
          border-radius: 8px;
          color: #7f8c8d;
        }
          .filtros-container {
          display: flex;
          gap: 0.5rem;
          margin-left: 0.5rem;
          flex-wrap: wrap;
        }

        .filtro-select {
          padding: 0.6rem;
          border-radius: 6px;
          border: 1px solid #ddd;
          background: white;
          font-size: 0.9rem;
          color: #2c3e50;
          cursor: pointer;
          transition: all 0.2s;
          min-width: 180px;
        }

        .filtro-select[type="date"] {
          min-width: 160px;
        }

        .filtro-select:hover {
          border-color: #3498db;
          box-shadow: 0 2px 4px rgba(52, 152, 219, 0.1);
        }

        @media (max-width: 768px) {
          .container {
            padding: 1rem;
          }

          .titulo-principal {
            font-size: 1.8rem;
            margin-bottom: 1.5rem;
          }

          .form-busca {
            margin-bottom: 2rem;
          }

          .input-group {
            flex-direction: column;
          }

          .campo-busca {
            border-radius: 8px !important;
            width: 100%;
            margin-bottom: 0.5rem !important;
          }

          .filtros-container {
            flex-direction: column;
            width: 100%;
            margin-left: 0;
            gap: 0.5rem;
          }

          .filtro-select {
            width: 100%;
            min-width: unset;
          }
          .botao-busca {
            border-radius: 8px !important;
            width: 100%;
            padding: 0.8rem !important;
          }

          .dados-estatisticos {
            flex-direction: column;
            gap: 1rem;
          }

          .dado {
            width: 100%;
          }

          .resultados-container {
            padding: 1rem;
          }

          .grade-livros {
            grid-template-columns: 1fr;
          }

          .cartao-livro {
            padding: 1rem;
          }
        }
          

        @media (max-width: 480px) {
          .titulo-principal {
            font-size: 1.5rem;
          }

          .subtitulo {
            font-size: 1.2rem;
            flex-direction: column;
            align-items: flex-start;
            gap: 0.3rem;
          }

          .cabecalho-cartao {
            flex-direction: column;
            gap: 0.5rem;
          }

          .status {
            align-self: flex-start;
          }

          .detalhe {
            flex-direction: column;
            gap: 0.2rem;
          }

          .rotulo {
            min-width: auto;
          }
        }
      `}</style>
    </main>
  );
}
