import Link from "next/link";

export default function Header() {
  return (
    <header>
      <div className="header-content">
        <h1>
          <Link href="/">📚 Biblioteca Online</Link>
        </h1>
        <nav className="header-nav">
          <Link href="/">Início</Link>
          <Link href="/registrarEmprestimo">Registrar Empréstimo</Link>
          <Link href="/emprestimos">Livros Emprestados</Link>
        </nav>
      </div>
    </header>
  );
}
