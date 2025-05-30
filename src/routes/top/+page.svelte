<script>
  import { onMount } from "svelte";
  import Calendar from "$lib/components/FullCalendar.svelte";

  // センサー一覧を配列で定義
  const sensorOptions = [
    { value: "frequency", label: "周波数" },
    { value: "kurtosis", label: "尖り値" },
    { value: "temperature", label: "温度" },
    { value: "vibration", label: "振動" },
  ];

  // bind:this で Calendar コンポーネントのインスタンスを受け取る
  let calendarComponent;
  let selectedSensor = "";
  let selectedMonth = "";
  let events = [];

  // ページ読み込み時は今月を初期値に
  onMount(() => {
    const now = new Date();
    now.setMonth(now.getMonth() - 2);
    selectedMonth = now.toISOString().slice(0, 7);
  });

  // ボタン押下時のハンドラ
  async function applyMonth() {
    if (!selectedMonth || !selectedSensor) return;

    await loadEvents();

    const [y, m] = selectedMonth.split("-");
    const target = new Date(Number(y), Number(m), 1);
    // Calendar.svelte で export した goto() を呼ぶ
    calendarComponent.goto(target);
  }

  // API から events を取得
  async function loadEvents() {
    const res = await fetch(`?month=${selectedMonth}&sensor=${selectedSensor}`);
    if (!res.ok) {
      console.error("データ取得エラー", await res.text());
      return;
    }
    const data = await res.json();
    events = data.events;
  }

  // 列幅・行高を百分率で管理
  let colWidth = 50;
  let rowHeight = 50;
  let isDraggingVert = false;
  let isDraggingHoriz = false;
  let container;

  function startDragVert(e) {
    isDraggingVert = true;
    window.addEventListener("mousemove", onDragVert);
    window.addEventListener("mouseup", stopDrag);
    e.preventDefault();
  }

  function onDragVert(e) {
    if (!isDraggingVert) return;
    const rect = container.getBoundingClientRect();
    let newWidth = ((e.clientX - rect.left) / rect.width) * 100;
    newWidth = Math.min(Math.max(newWidth, 10), 90);
    colWidth = newWidth;
  }

  function startDragHoriz(e) {
    isDraggingHoriz = true;
    window.addEventListener("mousemove", onDragHoriz);
    window.addEventListener("mouseup", stopDrag);
    e.preventDefault();
  }

  function onDragHoriz(e) {
    if (!isDraggingHoriz) return;
    const rect = container.getBoundingClientRect();
    let newHeight = ((e.clientY - rect.top) / rect.height) * 100;
    newHeight = Math.min(Math.max(newHeight, 10), 90);
    rowHeight = newHeight;
  }

  function stopDrag() {
    isDraggingVert = false;
    isDraggingHoriz = false;
    window.removeEventListener("mousemove", onDragVert);
    window.removeEventListener("mousemove", onDragHoriz);
    window.removeEventListener("mouseup", stopDrag);
  }
</script>

<main
  bind:this={container}
  class="grid-container"
  style="grid-template-columns: {colWidth}% calc(100% - {colWidth}%);
         grid-template-rows: {rowHeight}% calc(100% - {rowHeight}%);"
>
  <div class="cell top-left">
    <h1>ダッシュボード</h1>

    <!-- ① 月選択フォーム ↓ -->
    <div
      class="month-picker"
      style="margin-top:1rem; display:flex; align-items:center; gap:0.5rem;"
    >
      <label>
        月を選択：
        <input type="month" bind:value={selectedMonth} />
      </label>
      <label>
        センサー：
        <select bind:value={selectedSensor}>
          {#each sensorOptions as opt}
            <option value={opt.value}>{opt.label}</option>
          {/each}
        </select>
      </label>
      <button on:click={applyMonth}>適用</button>
    </div>
    <!-- ↑ ここまで -->
  </div>

  <div class="cell top-right">
    <Calendar bind:this={calendarComponent} {events} />
  </div>

  <div class="cell bottom-left">
    <!-- 他のコンテンツ -->
  </div>

  <div class="cell bottom-right">
    <!-- 他のコンテンツ -->
  </div>

  <!-- 列の間に縦方向ディバイダー -->
  <div
    class="divider vertical"
    on:mousedown={startDragVert}
    style="left: {colWidth}%;"
  ></div>

  <!-- 行の間に横方向ディバイダー -->
  <div
    class="divider horizontal"
    on:mousedown={startDragHoriz}
    style="top: {rowHeight}%;"
  ></div>
</main>

<style>
  .grid-container {
    position: relative;
    display: grid;
    gap: 1rem;
    height: 100vh;
    padding: 1rem;
    box-sizing: border-box;
  }

  .cell {
    background-color: #f9f9f9;
    padding: 1rem;
    border-radius: 0.5rem;
  }

  .divider.vertical {
    position: absolute;
    top: 1rem;
    bottom: 1rem;
    width: 5px;
    background: rgba(0, 0, 0, 0.1);
    cursor: col-resize;
    z-index: 10;
    transform: translateX(-50%);
  }

  .divider.horizontal {
    position: absolute;
    left: 1rem;
    right: 1rem;
    height: 5px;
    background: rgba(0, 0, 0, 0.1);
    cursor: row-resize;
    z-index: 10;
    transform: translateY(-50%);
  }
</style>
