import vm from "node:vm";

type FakeElement = {
  id: string;
  style: Record<string, string>;
  classList: { contains: (value: string) => boolean };
  className: string;
  value: string;
  innerHTML: string;
  textContent: string;
  children: FakeElement[];
  parentNode?: { removeChild: (child: FakeElement) => void };
  appendChild: (child: FakeElement) => FakeElement;
  removeChild: (child: FakeElement) => void;
  setAttribute: (name: string, value: string) => void;
  getAttribute: (name: string) => string;
  focus: () => void;
  contentWindow?: {
    document: {
      open: () => void;
      write: (value?: string) => void;
      close: () => void;
    };
  };
};

function createElement(id = ""): FakeElement {
  return {
    id,
    style: {},
    classList: { contains: () => false },
    className: "",
    value: "",
    innerHTML: "",
    textContent: "",
    children: [],
    appendChild(child) {
      this.children.push(child);
      child.parentNode = this;
      return child;
    },
    removeChild(child) {
      this.children = this.children.filter((current) => current !== child);
    },
    setAttribute(name, value) {
      this[name as keyof FakeElement] = value as never;
    },
    getAttribute(name) {
      const value = this[name as keyof FakeElement];
      return typeof value === "string" ? value : "";
    },
    focus() {},
  };
}

export function decryptVestmailHtml(
  buffer: Buffer,
  password: string
): string {
  if (!password.trim()) {
    throw new Error("보안메일 비밀번호가 필요합니다.");
  }

  const source = buffer.toString("latin1");
  const scripts = [...source.matchAll(/<script[^>]*>([\s\S]*?)<\/script>/gi)].map(
    (match) => match[1]
  );

  if (scripts.length === 0) {
    throw new Error("보안메일 스크립트를 찾을 수 없습니다.");
  }

  const elements = new Map<string, FakeElement>();
  const taskQueue: Array<string | (() => void)> = [];
  const alerts: string[] = [];

  const documentStub = {
    body: createElement("body"),
    written: "",
    createElement(tag: string) {
      const element = createElement(tag);

      if (tag.toLowerCase() === "iframe") {
        element.contentWindow = {
          document: {
            open() {},
            write() {},
            close() {},
          },
        };
      }

      return element;
    },
    getElementById(id: string) {
      if (!elements.has(id)) {
        const element = createElement(id);

        if (id === "__p" || id === "inputform") {
          element.parentNode = { removeChild() {} };
        }

        if (id === "password") {
          element.value = password;
        }

        elements.set(id, element);
      }

      return elements.get(id)!;
    },
    querySelector() {
      return createElement("query");
    },
    write(value: string) {
      this.written += value;
    },
    open() {},
    close() {},
  };

  const context = {
    console,
    window: {} as Record<string, unknown>,
    document: documentStub,
    navigator: {
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/137.0 Safari/537.36",
      platform: "Win32",
      vendor: "Google Inc.",
      appVersion: "5.0",
    },
    alert(message: string) {
      alerts.push(message);
    },
    atob(value: string) {
      return Buffer.from(value, "base64").toString("binary");
    },
    btoa(value: string) {
      return Buffer.from(value, "binary").toString("base64");
    },
    setTimeout(callback: string | (() => void)) {
      taskQueue.push(callback);
      return taskQueue.length;
    },
    clearTimeout() {},
    vestmail_onstart() {},
    vestmail_onend() {},
    PDFView: undefined,
    Blob: function Blob(parts: unknown[], options?: { type?: string }) {
      return { parts, type: options?.type };
    },
    URL: {
      createObjectURL() {
        return "blob://vestmail";
      },
    },
    decodeURI,
    decodeURIComponent,
    escape,
    unescape,
  };

  context.window = context as unknown as Record<string, unknown>;
  (context as Record<string, unknown>).org = documentStub.getElementById("org");
  (context as Record<string, unknown>).inputform =
    documentStub.getElementById("inputform");

  vm.createContext(context);

  for (const script of scripts) {
    try {
      vm.runInContext(script, context);
    } catch {
      // Ignore unrelated DOM setup and keep the decryptor path only.
    }
  }

  const doAction = (context as Record<string, unknown>).doAction;

  if (typeof doAction !== "function") {
    throw new Error("보안메일 복호화 함수를 찾을 수 없습니다.");
  }

  doAction();

  let processedTasks = 0;

  while (taskQueue.length > 0) {
    const task = taskQueue.shift()!;

    if (typeof task === "string") {
      vm.runInContext(task, context);
    } else {
      task();
    }

    processedTasks += 1;

    if (processedTasks > 1000) {
      throw new Error("보안메일 복호화 작업이 비정상적으로 길어졌습니다.");
    }
  }

  if (!documentStub.written) {
    throw new Error(alerts.at(-1) ?? "보안메일 복호화에 실패했습니다.");
  }

  return documentStub.written;
}
