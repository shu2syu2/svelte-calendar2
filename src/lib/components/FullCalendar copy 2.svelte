<script>
  import { onMount } from "svelte";
  import FullCalendar from "svelte-fullcalendar";
  import interactionPlugin from "@fullcalendar/interaction";
  import dayGridPlugin from "@fullcalendar/daygrid";
  import localesJa from "@fullcalendar/core/locales/ja";
  import "@fullcalendar/common/main.css";

  // 外部から渡す予定
  export let initialEvents = [];

  let calendar;
  let calendarApi = null;
  let dayOtherTop = 0;

  // オプションもここで定義
  const options = {
    droppable: true,
    editable: true,
    selectable: true,
    fixedWeekCount: true,
    themeSystem: "standard",
    initialView: "dayGridMonth",
    headerToolbar: false,
    locales: [localesJa],
    locale: "ja",
    timeZone: "Asia/Tokyo",
    plugins: [dayGridPlugin, interactionPlugin],
    dateClick: handleDateClick,
    eventClick: handleEventClick,
    // 高さを親要素にフィット
    height: '100%',
    datesSet: () => { dayOtherTop = 0; },
    dayCellDidMount: handleDayCellDidMount,
    events: initialEvents,
  };

  function handleDateClick(info) {
    // 必要ならここで処理
  }

  function handleEventClick(info) {
    const startDate = info.event.start;
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 1);
    calendarApi.select({ start: startDate, end: endDate, allDay: true });
  }

  function handleDayCellDidMount({ el, date, isOther }) {
    const numEl = el.querySelector(".fc-daygrid-day-number");
    if (!numEl) return;
    const day = date.getDate();
    const month = date.getMonth() + 1;
    if (isOther && dayOtherTop === 0) {
      dayOtherTop = day;
    } else if (!isOther && dayOtherTop !== 0) {
      dayOtherTop = 0;
    }
    if (day === 1 || (isOther && day === dayOtherTop)) {
      numEl.textContent = `${month}/${day}`;
    } else {
      numEl.textContent = `${day}`;
    }
  }

  onMount(() => {
    calendarApi = calendar.getAPI();
    console.log("Calendar instance:", calendarApi);
  });

  // 親から呼び出すためのメソッドをエクスポート
  export function goto(date) {
    if (calendarApi) {
      calendarApi.gotoDate(date);
    }
  }
</script>

<div class="Calendar">
  <FullCalendar {options} bind:this={calendar} />
</div>

<style>
  .Calendar {
    width: 100%;
    height: 100%;
    /* コンテナにフィット */
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
