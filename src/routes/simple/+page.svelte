<script>
  import { onMount } from "svelte";
  import FullCalendar from "svelte-fullcalendar";
 
  import interactionPlugin from "@fullcalendar/interaction";
  import dayGridPlugin from "@fullcalendar/daygrid";
  import allLocales from "@fullcalendar/core/locales-all";
 
  import "@fullcalendar/common/main.css";

  let calendar = null;
  let calendarApi = null;
  let dayOtherTop = 0;

  // イベントの初期データ
  const initialEvents = [
  ];

  const options = {
    droppable: true,
    editable: true,
    // 日付選択有無
    selectable: false,
    // 6週固定
    fixedWeekCount: true,
    themeSystem: "standard",
    // 初期表示
    initialView: "dayGridMonth",
    // ヘッダ表示 左/真ん中/右
    headerToolbar: false,
    locales: allLocales,
    locale: "ja",
    timeZone: "Asia/Tokyo",
    dayCellContent: function (arg) {
      return arg.date.getDate();
    },
    plugins: [dayGridPlugin, interactionPlugin],
    dateClick: handleDateClick,
    // レスポンシブ対応のためにaspectRatioを設定
    aspectRatio: 1.5,
    // 高さを自動調整
    height: "auto",
    datesSet: () => { dayOtherTop = 0;},
    // 日付表示編集
    dayCellDidMount: ({ el, date, isOther }) => {
      const numEl = el.querySelector(".fc-daygrid-day-number");
      if (!numEl) return;

      const day   = date.getDate();
      const month = date.getMonth() + 1;

      // 他月の初日
      if (isOther && dayOtherTop === 0) {
        dayOtherTop = day;
      }
      else if (!isOther && dayOtherTop !=0) {
        dayOtherTop = 0;
      }

      // その月の日数
      if (day === 1) {
        // “1日” はいつでも月/日
        numEl.textContent = `${month}/${day}`;
      }
      else if (isOther && day === dayOtherTop) {
        // 他月の初日は月/日
        numEl.textContent = `${month}/${day}`;
      }
      else {
        // それ以外は日付のみ
        numEl.textContent = `${day}`;
      }
    },
    events: initialEvents,
  };

  function handleDateClick(info) {
    if (!calendarApi) {
      calendarApi = info.view.calendar;
    }

    // const clickedDate = info.date;
    // const calendarDate = calendarApi.getDate();

    // const clickedMonth = clickedDate.getMonth();
    // const clickedYear = clickedDate.getFullYear();

    // const calendarMonth = calendarDate.getMonth();
    // const calendarYear = calendarDate.getFullYear();
  }

  onMount(() => {
    console.log("Calendar instance:", calendar);
  });
</script>

<div class="Calendar">
  <FullCalendar {options} bind:this={calendar} />
</div>

<style>
  .Calendar {
    width: 50vw;
    margin: 0 auto;
  }

  /* フルカレンダーのレスポンシブ対応 */
  :global(.fc) {
    max-width: 100%;
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
</style>