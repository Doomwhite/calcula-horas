#!/usr/bin/env node

const readline = require("readline");

class WorkTimeCalculator {
  constructor() {
    this.rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    this.records = [];
    this.WORK_DAY_MINUTES = 528; // 8h48m padrão (8 * 60 + 48)
  }

  parseTime(time) {
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  formatTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  }

  calculateWorkedTime() {
    let totalMinutes = 0;
    for (let i = 0; i < this.records.length - 1; i += 2) {
      totalMinutes += this.records[i + 1] - this.records[i];
    }
    return totalMinutes;
  }

  calculateRemainingTime() {
    const worked = this.calculateWorkedTime();
    const remaining = this.WORK_DAY_MINUTES - worked;
    return remaining > 0 ? remaining : 0;
  }

  showHelp() {
    console.log(`
Comandos disponíveis:
  help         - Mostra esta ajuda
  set [hh:mm]  - Configura a duração do dia de trabalho (padrão: 08:48)
  [hh:mm]      - Registra uma batida de entrada ou saída
  done         - Calcula e mostra o horário de saída com detalhes
  exit         - Encerra o programa

Exemplo de uso:
  08:00        (primeira entrada)
  12:00        (saída almoço)
  13:00        (volta almoço)
  done         (calcula saída)
`);
  }

  formatRecords() {
    let result = "Batidas registradas:\n";
    for (let i = 0; i < this.records.length; i++) {
      const type = i % 2 === 0 ? "Entrada" : "Saída";
      result += `${type}: ${this.formatTime(this.records[i])}\n`;
    }
    return result;
  }

  processInput(input) {
    const trimmedInput = input.trim().toLowerCase();

    switch (true) {
      case trimmedInput === "help":
        this.showHelp();
        return true;

      case trimmedInput === "exit":
        this.rl.close();
        return false;

      case trimmedInput.startsWith("set "):
        const time = trimmedInput.split(" ")[1];
        try {
          this.WORK_DAY_MINUTES = this.parseTime(time);
          console.log(`Dia de trabalho configurado para ${time} (${this.WORK_DAY_MINUTES} minutos)`);
        } catch {
          console.log("Formato inválido. Use hh:mm (ex: 08:48)");
        }
        return true;

      case trimmedInput === "done":
        if (this.records.length === 0) {
          console.log("Registre pelo menos uma entrada e saída antes de calcular!");
          return true;
        }
        
        const workedMinutes = this.calculateWorkedTime();
        const remainingMinutes = this.calculateRemainingTime();
        const lastTime = this.records[this.records.length - 1];
        const exitTime = this.formatTime(lastTime + remainingMinutes);

        console.log("\n=== Relatório Final ===");
        console.log(this.formatRecords());
        console.log(`Tempo total configurado: ${this.formatTime(this.WORK_DAY_MINUTES)}`);
        console.log(`Tempo trabalhado: ${this.formatTime(workedMinutes)}`);
        console.log(`Tempo restante: ${this.formatTime(remainingMinutes)}`);
        console.log(`Horário de saída: ${exitTime}`);
        console.log("==================");

        this.rl.close();
        return false;

      case /^\d{2}:\d{2}$/.test(trimmedInput):
        this.records.push(this.parseTime(trimmedInput));
        return true;

      default:
        console.log("Comando inválido. Digite 'help' para ajuda.");
        return true;
    }
  }

  start() {
    const getPrompt = () => {
      if (this.records.length === 0) return "Primeira batida (hh:mm) ou 'help': ";
      return this.records.length % 2 === 0
        ? "Próxima entrada (hh:mm) ou 'done': "
        : "Próxima saída (hh:mm) ou 'done': ";
    };

    const ask = () => {
      this.rl.question(getPrompt(), (input) => {
        if (this.processInput(input)) {
          ask();
        }
      });
    };

    console.log("Calculadora de Horas de Trabalho - Digite 'help' para ajuda");
    ask();
  }
}

function main() {
  const calculator = new WorkTimeCalculator();
  calculator.start();
}

main();