"use client"; // Required for client-side interactivity

import { useState } from "react";

export default function RegistrarEmprestimoPage() {
  // State for form fields
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

  const [showAlunoFields, setShowAlunoFields] = useState(false);
  const [showProfessorFields, setShowProfessorFields] = useState(false);

  // Handle input changes
  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  // Handle tipo_pessoa change
  const handleTipoPessoaChange = (e) => {
    const value = e.target.value;
    setFormData((prev) => ({
      ...prev,
      tipo_pessoa: value,
    }));

    setShowAlunoFields(value === "aluno");
    setShowProfessorFields(value === "professor");
  };

  // Validate number inputs
  const validateNumber = (e) => {
    if (e.target.value < 0) {
      e.target.value = 1;
    }
    handleChange(e);
  };

  // Handle form submission
  const handleBuscarLivro = (e) => {
    e.preventDefault();
    // Add your buscarLivro logic here
  };

  const handleEmprestarLivro = (e) => {
    e.preventDefault();
    // Add your emprestarLivro logic here
  };

  return (
    <>
      <div className="container">
        <h2>Buscar Livro</h2>
        <input
          type="number"
          id="buscar_tombo"
          min="1"
          onChange={validateNumber}
          placeholder="Número do Tombo"
          value={formData.buscar_tombo}
        />
        <button onClick={handleBuscarLivro}>Buscar</button>
        <p id="livro-info"></p>
      </div>

      <div className="container">
        <h2>Registrar Empréstimo</h2>
        <form onSubmit={handleEmprestarLivro}>
          <input
            type="number"
            id="tombo_emprestimo"
            placeholder="Número do Tombo"
            required
            value={formData.tombo_emprestimo}
            onChange={handleChange}
          />

          <input
            type="number"
            id="quantidade_emprestimo"
            min="1"
            onChange={validateNumber}
            placeholder="Quantidade de Livros"
            required
            value={formData.quantidade_emprestimo}
          />

          <select
            id="tipo_pessoa"
            onChange={handleTipoPessoaChange}
            value={formData.tipo_pessoa}
            required
          >
            <option value="" disabled>
              Selecione o tipo
            </option>
            <option value="aluno">Aluno</option>
            <option value="professor">Professor</option>
          </select>

          {showAlunoFields && (
            <div id="campos_aluno">
              <input
                type="text"
                id="nome_estudante"
                placeholder="Nome do Aluno"
                value={formData.nome_estudante}
                onChange={handleChange}
              />
            </div>
          )}

          <select
            id="serie_estudante"
            required
            value={formData.serie_estudante}
            onChange={handleChange}
          >
            <option value="" disabled>
              Selecione a série
            </option>
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

          <label htmlFor="turma">Turma:</label>
          <select
            id="turma"
            name="turma"
            value={formData.turma}
            onChange={handleChange}
          >
            <option value="" disabled>
              Selecione a turma
            </option>
            <option value="A">A</option>
            <option value="B">B</option>
            <option value="C">C</option>
          </select>

          {showProfessorFields && (
            <div id="campos_professor">
              <input
                type="text"
                id="nome_professor"
                placeholder="Nome do Professor"
                value={formData.nome_professor}
                onChange={handleChange}
              />
            </div>
          )}

          <label htmlFor="data_devolucao">Data Máxima de Devolução:</label>
          <input
            type="date"
            id="data_devolucao"
            required
            value={formData.data_devolucao}
            onChange={handleChange}
          />

          <button type="submit">Emprestar</button>
        </form>
      </div>
    </>
  );
}
