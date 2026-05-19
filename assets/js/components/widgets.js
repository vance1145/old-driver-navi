const Widgets = {
  initClock() {
    const updateClock = () => {
      const now = new Date();
      const time = document.getElementById('clockTime');
      const date = document.getElementById('clockDate');
      if (time) time.textContent = now.toTimeString().slice(0, 5);
      if (date) {
        const weekdays = ['日', '一', '二', '三', '四', '五', '六'];
        date.textContent = `${now.getFullYear()}年${now.getMonth() + 1}月${now.getDate()}日 周${weekdays[now.getDay()]}`;
      }
    };
    updateClock();
    setInterval(updateClock, 1000);
  }
};
