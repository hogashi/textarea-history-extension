const LOCAL_STORAGE_KEY = "textarea-histories";

function main() {
  // トークンとかはとらないようにする
  const inputs = [...document.querySelectorAll('input:not([type="hidden"])')];
  const textareas = [...document.querySelectorAll("textarea")];

  if (inputs.length === 0 && textareas.length === 0) {
    return;
  }

  const inputHistories = JSON.parse(localStorage.getItem(LOCAL_STORAGE_KEY) || "[]");

  function saveHistory(elements) {
    const datetime = new Date().toISOString();

    localStorage.setItem(
      LOCAL_STORAGE_KEY,
      JSON.stringify([
        ...inputHistories,
        {
          datetime,
          texts: [
            ...elements.map((element) => {
              return {
                name: element.name,
                value: element.value,
              };
            }),
          ],
        },
      ])
    );
  }

  // 最初はまず全部保存する
  saveHistory([...inputs, ...textareas]);

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

        saveHistory([element]);
      });
    });
  });
}

main();
