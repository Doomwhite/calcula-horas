#!/usr/bin/env node

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

const WORK_DAY_MINUTES = 8 * 60 + 48; // 8 horas e 48 minutos em minutos

function parseTime(time) {
  const [hours, minutes] = time.split(":").map(Number);
  return hours * 60 + minutes; // Converte para minutos
}

function formatTime(minutes) {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function calculateRemainingTime(records) {
  let totalMinutes = 0;

  for (let i = 0; i < records.length; i += 2) {
    if (i + 1 < records.length) {
      totalMinutes += records[i + 1] - records[i];
    }
  }

  const remainingMinutes = WORK_DAY_MINUTES - totalMinutes;
  return remainingMinutes > 0 ? remainingMinutes : 0;
}

function main() {
  const records = [];

  function askForTime(message) {
    rl.question(message, (input) => {
      if (input.toLowerCase() === "done") {
        const remainingMinutes = calculateRemainingTime(records);
        const lastTimestamp = records[records.length - 1];
        const exitTime = formatTime(lastTimestamp + remainingMinutes);

        console.log(
          `Você deverá sair às ${exitTime} para completar 8h48m de trabalho.`
        );
        rl.close();
        return;
      }

      records.push(parseTime(input));
      const nextMessage =
        records.length % 2 === 0
          ? "Informe a próxima batida (hh:mm) ou 'done' para calcular: "
          : "Informe a próxima saída (hh:mm) ou 'done' para calcular: ";

      askForTime(nextMessage);
    });
  }

  askForTime("Informe a primeira batida (hh:mm): ");
}

main();
