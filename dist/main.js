const LOCAL_STORAGE_KEY = "textarea-histories";

function main() {
  // 見えるテキスト入力欄をとる
  const inputs = [...document.querySelectorAll("input")].filter((i) => {
    const { width, height } = i.getBoundingClientRect();
    return width + height > 0;
  });
  const textareas = [...document.querySelectorAll("textarea")].filter((i) => {
    const { width, height } = i.getBoundingClientRect();
    return width + height > 0;
  });

  if (inputs.length === 0 && textareas.length === 0) {
    return;
  }

  const inputHistories = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");

  function saveHistory() {
    const datetime = new Date().toISOString();

    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify([
        ...inputHistories,
        {
          datetime,
          history: {
            inputs: [...inputs].map((input) => input.value),
            textareas: [...textareas].map((textarea) => textarea.value),
          },
        },
      ])
    );
  }

  saveHistory();

  const eventNames = ["input", "change", "keydown"];
  let isInterval = {
    input: false,
    change: false,
    keydown: false,
  };

  [...inputs, ...textareas].forEach((element) => {
    eventNames.forEach((eventName) => {
      element.addEventListener(eventName, (event) => {
        // 日本語入力中だったら何もしない
        if (event.isComposing) {
          return;
        }

        // 保存しまくらないように10秒ごとに保存にする
        if (isInterval[eventName]) {
          return;
        }
        isInterval[eventName] = true;
        setTimeout(() => {
          isInterval[eventName] = false;
        }, 10000);

        saveHistory();
      });
    });
  });
}

main();
