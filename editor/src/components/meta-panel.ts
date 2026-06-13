export interface MetaPanelData {
  title: string;
  weight?: number;
  [key: string]: string | number | undefined;
}

export interface MetaPanelAPI {
  update(data: MetaPanelData): void;
  getData(): MetaPanelData;
}

export function mountMetaPanel(
  container: HTMLElement,
  onChange: (data: MetaPanelData) => void,
): MetaPanelAPI {
  let currentData: MetaPanelData = { title: "" };

  container.innerHTML = `
    <div class="meta-panel-wrapper">
      <div class="meta-panel">
        <div class="meta-panel-header">Page Metadata</div>
        <div class="meta-field">
          <label>Title</label>
          <input type="text" class="meta-title" />
        </div>
        <div class="meta-field">
          <label>Weight</label>
          <input type="number" class="meta-weight" />
        </div>
        <div class="meta-extra-header">Extra Fields</div>
        <div class="meta-extra"></div>
      </div>
      <div class="meta-panel-footer">
        <a href="https://github.com/sgtrusty/sgtwiki" target="_blank" rel="noopener noreferrer" class="github-link">
          <svg class="github-icon" viewBox="0 0 24 24" aria-hidden="true">
            <path fill="currentColor" d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
          <span>View on GitHub</span>
        </a>
      </div>
    </div>
  `;

  const titleInput = container.querySelector(".meta-title") as HTMLInputElement;
  const weightInput = container.querySelector(
    ".meta-weight",
  ) as HTMLInputElement;
  const extraContainer = container.querySelector(".meta-extra") as HTMLElement;
  const addBtn = document.createElement("button");
  addBtn.className = "meta-extra-add";
  addBtn.textContent = "+ Add Field";
  addBtn.addEventListener("click", () => {
    const row = document.createElement("div");
    row.className = "meta-extra-row";
    row.innerHTML = `
      <input class="meta-extra-key" placeholder="key" />
      <input class="meta-extra-val" placeholder="value" />
      <button class="meta-extra-remove">×</button>
    `;
    row.querySelector(".meta-extra-remove")!.addEventListener("click", () => {
      row.remove();
      notify();
    });
    (row.querySelector(".meta-extra-key") as HTMLInputElement).addEventListener(
      "input",
      notify,
    );
    (row.querySelector(".meta-extra-val") as HTMLInputElement).addEventListener(
      "input",
      notify,
    );
    extraContainer.appendChild(row);
    row.querySelector("input")!.focus();
  });
  container.querySelector(".meta-panel")!.appendChild(addBtn);

  function notify() {
    const data = getData();
    onChange(data);
  }

  function getData(): MetaPanelData {
    const data: MetaPanelData = { title: titleInput.value };
    const w = parseInt(weightInput.value);
    if (!isNaN(w)) data.weight = w;

    extraContainer.querySelectorAll(".meta-extra-row").forEach((row) => {
      const keyInput = row.querySelector(".meta-extra-key") as HTMLInputElement;
      const valInput = row.querySelector(".meta-extra-val") as HTMLInputElement;
      if (keyInput.value) data[keyInput.value] = valInput.value;
    });

    return data;
  }

  function renderExtra(extra: Record<string, string>) {
    extraContainer.innerHTML = "";
    for (const [key, val] of Object.entries(extra)) {
      const row = document.createElement("div");
      row.className = "meta-extra-row";
      row.innerHTML = `
        <input class="meta-extra-key" value="${key}" placeholder="key" />
        <input class="meta-extra-val" value="${val}" placeholder="value" />
        <button class="meta-extra-remove">×</button>
      `;
      row.querySelector(".meta-extra-remove")!.addEventListener("click", () => {
        row.remove();
        notify();
      });
      (
        row.querySelector(".meta-extra-key") as HTMLInputElement
      ).addEventListener("input", notify);
      (
        row.querySelector(".meta-extra-val") as HTMLInputElement
      ).addEventListener("input", notify);
      extraContainer.appendChild(row);
    }
  }

  titleInput.addEventListener("input", notify);
  weightInput.addEventListener("input", notify);

  return {
    update(data: MetaPanelData) {
      currentData = data;
      titleInput.value = data.title || "";
      weightInput.value = data.weight != null ? String(data.weight) : "";

      const extras: Record<string, string> = {};
      for (const [key, val] of Object.entries(data)) {
        if (key !== "title" && key !== "weight" && val !== undefined) {
          extras[key] = String(val);
        }
      }
      renderExtra(extras);
    },
    getData,
  };
}
