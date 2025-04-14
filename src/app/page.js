"use client";
import { useState } from 'react';

export default function Home() {
  const [termoBusca, setTermoBusca] = useState('');
  const [resultados, setResultados] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleBuscarLivros = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const res = await fetch(`/api/livros?termo=${encodeURIComponent(termoBusca)}`);
      const data = await res.json();
      
      if (res.ok) {
        setResultados(data);
      } else {
        throw new Error(data.error || 'Erro ao buscar livros');
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
        <h1>Biblioteca - Acervo de Livros</h1>
        
        <form onSubmit={handleBuscarLivros} className="form-busca">
          <input
            type="text"
            value={termoBusca}
            onChange={(e) => setTermoBusca(e.target.value)}
            placeholder="Digite o título do livro"
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Buscando...' : 'Buscar'}
          </button>
        </form>

        {resultados && (
          <div className="resultados-container">
            <div className="estatisticas">
              <h3>Estatísticas:</h3>
              <p><strong>Total de livros:</strong> {resultados.estatisticas.total}</p>
              <p><strong>Disponíveis:</strong> {resultados.estatisticas.disponiveis}</p>
              <p><strong>Emprestados:</strong> {resultados.estatisticas.emprestados}</p>
            </div>

            <div className="lista-livros">
              <h3>Resultados:</h3>
              {resultados.livros.length === 0 ? (
                <p>Nenhum livro encontrado.</p>
              ) : (
                <ul>
                  {resultados.livros.map(livro => (
                    <li key={livro.id} className="livro-item">
                      <h4>{livro.titulo}</h4>
                      <p><strong>Tombo:</strong> {livro.numeroTombo}</p>
                      <p><strong>Autor:</strong> {livro.autor}</p>
                      <p><strong>Status:</strong> 
                        <span className={livro.status === 'Disponível' ? 'disponivel' : 'emprestado'}>
                          {livro.status}
                        </span>
                      </p>
                      {livro.destinatario && (
                        <p><em>Emprestado para: {livro.destinatario}</em></p>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </div>

    </main>
  );
}