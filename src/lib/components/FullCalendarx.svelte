<script>
  import { onMount } from "svelte";
  import FullCalendar from "svelte-fullcalendar";
  import interactionPlugin from "@fullcalendar/interaction";
  import dayGridPlugin from "@fullcalendar/daygrid";
  import jaLocale from "@fullcalendar/core/locales/ja";
  import "@fullcalendar/common/main.css";

  // 外部から渡す予定のイベント
  export let initialEvents = [];

  let calendar;
  let calendarApi = null;
  let firstOtherTop = null;

  // カレンダーオプション定義
  const options = {
    droppable: true,
    editable: true,
    selectable: true,
    fixedWeekCount: true,
    themeSystem: "standard",
    initialView: "dayGridMonth",
    headerToolbar: false,
    locales: [jaLocale],
    locale: "ja",
    timeZone: "Asia/Tokyo",
    plugins: [dayGridPlugin, interactionPlugin],
    height: "100%",
    datesSet: () => {
      // ビュー切り替え時に前/次月先頭リセット
      firstOtherTop = null;
    },
    dayCellDidMount: handleDayCellDidMount,
    events: initialEvents,
  };

  function handleDayCellDidMount({ el, date, isOther }) {
    const numEl = el.querySelector(".fc-daygrid-day-number");
    if (!numEl) return;

    const day = date.getDate();
    const month = date.getMonth() + 1;
    let text;

    if (!isOther && day === 1) {
      // 当月1日 => 月/日表示
      firstOtherTop = null;     // 明示的にリセット
      text = `${month}/${day}日`;
    } else if (isOther && firstOtherTop === null) {
      // 前月 or 次月の最初のセルだけ => 月/日表示
      firstOtherTop = day;
      text = `${month}/${day}日`;
    } else {
      // その他 => 日付のみ
      text = `${day}日`;
    }

    numEl.textContent = text;
  }

  onMount(() => {
    calendarApi = calendar.getAPI();
  });

  // 親から呼び出すメソッド
  export function goto(date) {
    if (!calendarApi) return;
    // 同じ月を再適用するときも必ずリセット＆再描画
    firstOtherTop = null;
    calendarApi.changeView("dayGridMonth", date);
  }
</script>

<div class="Calendar">
  <FullCalendar {options} bind:this={calendar} />
</div>

<style>
  .Calendar {
    width: 100%;
    height: 100%;
  }

  /* フルカレンダーのレスポンシブ対応 */
  :global(.fc) {
    width: 100% !important;
    height: 100% !important;
  }

  /* ヘッダー */
  :global(.fc .fc-col-header-cell) {
    background-color: #099999;
    height: 5vh;
    padding: 0;
    vertical-align: middle;
    border-width: 2px;
    border-bottom-width: 0px;
  }
  :global(.fc .fc-col-header-cell-cushion) {
    color: white;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100%;
    font-size: 1.5em;
    font-weight: normal;
  }

  /* 丸める */
  :global(.fc .fc-col-header-cell:first-child) {
    border-top-left-radius: 0.5rem;
    overflow: hidden;
  }
  :global(.fc .fc-col-header-cell:last-child) {
    border-top-right-radius: 0.5rem;
    overflow: hidden;
  }

  /* 日付セルの高さを調整 */
  :global(.fc .fc-daygrid-day-frame),
  :global(.fc .fc-daygrid-day) {
    height: 50px; /* 日付セルの高さを設定 */
    overflow: hidden;
  }

  /* 日付番号を左上に移動 */
  :global(.fc .fc-daygrid-day-top) {
    position: relative;
    z-index: 2;
  }
  /* イベントの表示領域を調整 */
  :global(.fc .fc-daygrid-day-events) {
    margin-top: 15px;
    margin-left: 25px;
  }

  :global(.fc .fc-daygrid-day-number) {
    position: absolute;
    top: 2px;
    left: 0;
    right: 0;
    text-align: left;
    padding: 0;
    font-size: 0.8em;
    font-weight: normal;
    color: #333;
  }

  /* セル内のパディングを調整 */
  :global(.fc .fc-daygrid-day-frame) {
    padding: 2px;
  }

  /* 日付部の線色だけを上書き */
  :global(.fc .fc-scrollgrid-section-body td) {
    border-color: #099999;
    border-width: 2px;
  }

  /* スクロールやレイアウト崩れを防ぐためにオーバーフローを調整 */
  :global(.fc-scroller-harness, .fc-scroller-harness-liquid) {
    overflow: hidden;
  }

  /* メディアクエリを使用してフォントサイズを調整 */
  @media screen and (max-width: 768px) {
    :global(.fc) {
      font-size: 0.8em;
    }
    :global(.fc .fc-col-header-cell-cushion) {
      font-size: 1em; /* 小さい画面でのヘッダーフォントサイズ */
    }

    :global(.fc .fc-daygrid-day-number) {
      font-size: 0.8em; /* 小さい画面での日付番号フォントサイズ */
    }
  }

  /* 当日に色を付けない */
  :global(.fc .fc-day-today) {
    background-color: transparent !important;
    color: inherit !important;
  }

  /* イベント本体の枠線を消す */
  :global(.fc .fc-daygrid-event) {
    background-color: inherit !important;
    border: none !important;
  }

  /* イベント内部フレームの枠線も消す */
  :global(.fc .fc-event-main-frame) {
    background-color: inherit !important;
    border: none !important;
  }

  /* イベントタイトル／時間は黒文字のまま */
  :global(.fc .fc-event-title),
  :global(.fc .fc-event-time) {
    color: #000 !important;
  }

  /* イベント ホバーアイコンは変えない */
  :global(.fc .fc-daygrid-day-frame),
  :global(.fc .fc-daygrid-day-frame:hover),
  :global(.fc .fc-daygrid-event),
  :global(.fc .fc-daygrid-event:hover),
  :global(.fc .fc-event-main-frame),
  :global(.fc .fc-event-main-frame:hover) {
    cursor: default !important;
  }
</style>
