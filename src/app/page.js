export default function Home() {
  return (
    <main className="container emprestimos-container">
      <div>
        <h1>Lista de Livros</h1>
        <input
          type="text"
          id="buscarLivro"
          placeholder="Digite o nome do livro"
        />
        <button>Buscar</button>
        <p id="livro-info"></p>
        <div id="listaLivros"></div>
      </div>
    </main>
  );
}
