"use strict";

(() => {
  const Calendar = window.WosVipCalendar;
  const Holidays = window.WosVipHolidays;

  const hoje = Calendar.zerarHora(new Date());
  let dataSelecionada = null;

  const selectMes = document.getElementById("mes");
  const selectAno = document.getElementById("ano");
  const calendario = document.getElementById("calendario");
  const listaFeriados = document.getElementById("listaFeriados");
  const infoSelecionada = document.getElementById("dataSelecionada");
  const dataAtualCabecalho = document.getElementById("dataAtualCabecalho");
  const calendarShell = document.querySelector(".calendar-shell");
  const app = document.querySelector(".app");

  function preencherSeletores(){
    Calendar.meses.forEach((mes, indice) => {
      const option = document.createElement("option");
      option.value = indice;
      option.textContent = mes;
      selectMes.appendChild(option);
    });

    const anoAtual = hoje.getFullYear();
    for(let ano = anoAtual - 50; ano <= anoAtual + 50; ano++){
      const option = document.createElement("option");
      option.value = ano;
      option.textContent = ano;
      selectAno.appendChild(option);
    }

    selectMes.value = hoje.getMonth();
    selectAno.value = hoje.getFullYear();
  }

  function atualizarCabecalho(){
    dataAtualCabecalho.textContent = new Intl.DateTimeFormat("pt-BR", {
      weekday:"long",
      day:"2-digit",
      month:"long",
      year:"numeric"
    }).format(hoje);
  }

  function atualizarInfoSelecionada(data, feriado){
    if(!data){
      infoSelecionada.innerHTML =
        '<span aria-hidden="true">📌</span><div>Toque em um dia para ver os detalhes.</div>';
      return;
    }

    const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
      weekday:"long",
      day:"2-digit",
      month:"long",
      year:"numeric"
    }).format(data);

    const complemento = feriado
      ? ` • ${feriado.nome} (${feriado.tipo})`
      : "";

    infoSelecionada.innerHTML =
      `<span aria-hidden="true">📌</span><div><strong>${dataFormatada}</strong>${complemento}</div>`;
  }

  function renderizarFeriados(feriados, mes){
    listaFeriados.innerHTML = "";

    const feriadosMes = feriados
      .filter(item => item.data.getMonth() === mes)
      .sort((a, b) => a.data - b.data);

    if(feriadosMes.length === 0){
      const li = document.createElement("li");
      li.textContent = "Não há datas nacionais cadastradas neste mês.";
      listaFeriados.appendChild(li);
      return;
    }

    feriadosMes.forEach(feriado => {
      const li = document.createElement("li");
      li.innerHTML =
        `<strong>${String(feriado.data.getDate()).padStart(2,"0")}/${String(mes + 1).padStart(2,"0")}</strong>`
        + ` — ${feriado.nome}<br><small>${feriado.tipo}</small>`;
      listaFeriados.appendChild(li);
    });
  }

  function selecionarDia(data, feriado){
    if(dataSelecionada && Calendar.mesmaData(dataSelecionada, data)){
      dataSelecionada = null;
    }else{
      dataSelecionada = data;
    }

    atualizarInfoSelecionada(dataSelecionada, dataSelecionada ? feriado : null);
    gerarCalendario();
  }

  function gerarCalendario(){
    calendario.innerHTML = "";

    const mes = Number(selectMes.value);
    const ano = Number(selectAno.value);
    const feriados = Holidays.listar(ano);
    const mapaFeriados = new Map(
      feriados.map(item => [Calendar.chaveData(item.data), item])
    );

    const inicioSemanaAtual = Calendar.inicioSemanaDomingo(hoje);
    const grade = Calendar.criarGrade(ano, mes);

    grade.forEach(semana => {
      const linha = document.createElement("tr");

      if(Calendar.mesmaData(semana.inicio, inicioSemanaAtual)){
        linha.classList.add("current-week");
      }

      const celulaSemana = document.createElement("td");
      celulaSemana.className = "week-number";
      celulaSemana.textContent = semana.numeroISO;
      linha.appendChild(celulaSemana);

      semana.dias.forEach(data => {
        const celula = document.createElement("td");
        const feriado = mapaFeriados.get(Calendar.chaveData(data));

        celula.classList.add("day");
        celula.textContent = data.getDate();
        celula.dataset.date = Calendar.chaveData(data);
        celula.setAttribute("role", "button");
        celula.setAttribute("tabindex", "0");
        celula.setAttribute(
          "aria-label",
          `${data.getDate()} de ${Calendar.meses[data.getMonth()]} de ${data.getFullYear()}`
          + (feriado ? `, ${feriado.nome}` : "")
        );

        if(data.getMonth() !== mes){
          celula.classList.add("other-month");
        }
        if(data.getDay() === 0){
          celula.classList.add("sunday");
        }
        if(data.getDay() === 6){
          celula.classList.add("saturday");
        }
        if(feriado){
          celula.classList.add("holiday");
          const ponto = document.createElement("span");
          ponto.className = "holiday-dot";
          ponto.setAttribute("aria-hidden", "true");
          celula.appendChild(ponto);
        }
        if(Calendar.mesmaData(data, hoje)){
          celula.classList.add("today");
        }
        if(dataSelecionada && Calendar.mesmaData(data, dataSelecionada)){
          celula.classList.add("selected");
        }

        const executarSelecao = () => selecionarDia(data, feriado);

        celula.addEventListener("click", executarSelecao);
        celula.addEventListener("keydown", event => {
          if(event.key === "Enter" || event.key === " "){
            event.preventDefault();
            executarSelecao();
          }
        });

        linha.appendChild(celula);
      });

      calendario.appendChild(linha);
    });

    renderizarFeriados(feriados, mes);

    if(dataSelecionada){
      const feriadoSelecionado = mapaFeriados.get(Calendar.chaveData(dataSelecionada));
      atualizarInfoSelecionada(dataSelecionada, feriadoSelecionado);
    }else{
      atualizarInfoSelecionada(null, null);
    }
  }

  function mudarMes(delta){
    const data = new Date(
      Number(selectAno.value),
      Number(selectMes.value) + delta,
      1
    );

    selectMes.value = data.getMonth();
    selectAno.value = data.getFullYear();
    dataSelecionada = null;
    gerarCalendario();
  }

  selectMes.addEventListener("change", () => {
    dataSelecionada = null;
    gerarCalendario();
  });

  selectAno.addEventListener("change", () => {
    dataSelecionada = null;
    gerarCalendario();
  });

  document.getElementById("mesAnterior")
    .addEventListener("click", () => mudarMes(-1));

  document.getElementById("mesSeguinte")
    .addEventListener("click", () => mudarMes(1));

  document.getElementById("btnHoje")
    .addEventListener("click", () => {
      selectMes.value = hoje.getMonth();
      selectAno.value = hoje.getFullYear();
      dataSelecionada = null;
      gerarCalendario();
    });

  app.addEventListener("click", event => {
    const clicouEmDia = event.target.closest(".day");
    const clicouEmControle = event.target.closest("button, select");

    if(!clicouEmDia && !clicouEmControle && dataSelecionada){
      dataSelecionada = null;
      gerarCalendario();
    }
  });

  let toqueInicialX = null;
  let toqueInicialY = null;

  calendarShell.addEventListener("touchstart", event => {
    const toque = event.changedTouches[0];
    toqueInicialX = toque.clientX;
    toqueInicialY = toque.clientY;
  }, { passive:true });

  calendarShell.addEventListener("touchend", event => {
    if(toqueInicialX === null || toqueInicialY === null){
      return;
    }

    const toque = event.changedTouches[0];
    const deltaX = toque.clientX - toqueInicialX;
    const deltaY = toque.clientY - toqueInicialY;

    if(Math.abs(deltaX) > 60 && Math.abs(deltaX) > Math.abs(deltaY) * 1.3){
      mudarMes(deltaX < 0 ? 1 : -1);
    }

    toqueInicialX = null;
    toqueInicialY = null;
  }, { passive:true });

  preencherSeletores();
  atualizarCabecalho();
  gerarCalendario();

  if("serviceWorker" in navigator){
    window.addEventListener("load", () => {
      navigator.serviceWorker.register("./sw.js").catch(error => {
        console.warn("Service Worker não registrado:", error);
      });
    });
  }
})();
