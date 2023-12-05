const LOCAL_STORAGE_KEY = "textarea-history-extension-histories";
const MAX_HISTORY_COUNT = 1000;

function main() {
  // トークンとかはとらないようにする
  const inputs = Array.from(document.querySelectorAll<HTMLInputElement>('input:not([type="hidden"])'));
  const textareas = Array.from(document.querySelectorAll("textarea"));

  if (inputs.length === 0 && textareas.length === 0) {
    return;
  }

  function saveHistory(elements: (HTMLInputElement | HTMLTextAreaElement)[]) {
    const datetime = new Date().toISOString();

    const texts = elements
      .filter((element) => element.value)
      .map((element) => {
        return {
          name: element.name,
          value: element.value,
        };
      });

    if (texts.length === 0) {
      return;
    }

    const inputHistories = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");
    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify([...inputHistories, { datetime, texts }].slice(-MAX_HISTORY_COUNT))
    );
  }

  // 最初はまず全部保存する
  saveHistory([...inputs, ...textareas]);

  const eventNames = ["input", "change", "keydown"];
  let isInterval: { [key: (typeof eventNames)[number]]: boolean } = {
    input: false,
    change: false,
    keydown: false,
  };
  let shouldSaveAfterInterval = false;

  [...inputs, ...textareas].forEach((element) => {
    eventNames.forEach((eventName) => {
      element.addEventListener(eventName, {
        handleEvent: (event: KeyboardEvent) => {
          // 日本語入力中だったら何もしない
          // Enterだったら変換確定だったりするので保存してみる
          if (event.isComposing && event.key !== "Enter") {
            return;
          }

          // 保存しまくらないように10秒ごとに保存にする
          if (isInterval[eventName]) {
            shouldSaveAfterInterval = true;
            return;
          }
          isInterval[eventName] = true;
          setTimeout(() => {
            isInterval[eventName] = false;
            if (shouldSaveAfterInterval) {
              saveHistory([element]);
              shouldSaveAfterInterval = false;
            }
          }, 10000);

          saveHistory([element]);
        },
      });
    });
  });
}

main();
