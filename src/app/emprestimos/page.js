export default function EmprestismosPage() {
  return (
    <div className="container emprestimos-container">
      <h2>Lista de Livros Emprestados</h2>
      <table>
        <thead>
          <tr>
            <th>Número do Tombo</th>
            <th>Título (QTD)</th>
            <th>Aluno/Professor</th>
            <th>Turma/Série</th>
            <th>Data do Empréstimo</th>
            <th>Data Máxima de Devolução</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody id="tabela-emprestimos"></tbody>
      </table>
    </div>
  );
}
