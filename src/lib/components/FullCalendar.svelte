<script>
  import { onMount } from "svelte";
  import FullCalendar from "svelte-fullcalendar";
  import interactionPlugin from "@fullcalendar/interaction";
  import dayGridPlugin from "@fullcalendar/daygrid";
  import jaLocale from "@fullcalendar/core/locales/ja";
  import "@fullcalendar/common/main.css";

  export let events = [];

  let calendar;
  let calendarApi;

  // 「既に描画で見た他月」を覚えておくセット
  let seenOtherMonths = new Set();

  // view 切り替え時にリセット
  function handleDatesSet() {
    seenOtherMonths.clear();
  }

  const options = {
    plugins: [dayGridPlugin, interactionPlugin],
    droppable: true,
    editable: true,
    // 日付選択有無
    selectable: true,
    // 6週固定
    fixedWeekCount: true,
    themeSystem: "standard",
    // 初期表示
    initialView: "dayGridMonth",
    headerToolbar: false,
    locale: "ja",
    timeZone: "Asia/Tokyo",
    height: "100%",
    // ここで見た他月をクリア
    datesSet: handleDatesSet,
    // 描画コンテンツを一度だけ決める
    dayCellContent: ({ date, isOther }) => {
      const m = date.getMonth() + 1;
      const d = date.getDate();
      // ・当月の１日 → 〈月／日〉
      if (!isOther && d === 1) {
        return { html: `${m}/${d}` };
      }
      // ・他月セル → 初回だけ〈月／日〉、以降は〈日〉
      if (isOther) {
        if (!seenOtherMonths.has(m)) {
          seenOtherMonths.add(m);
          return { html: `${m}/${d}` };
        }
        return { html: `${d}` };
      }
      // ・それ以外の当月セル →〈日〉だけ
      return { html: `${d}` };
    },

    events: events,
  };

  onMount(() => {
    calendarApi = calendar.getAPI();
  });

  export function goto(date) {
    if (!calendarApi) return;
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
