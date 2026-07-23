export const initTabs = () => {
  document.querySelectorAll('.js-tabs').forEach(wrapper => {
    const tabList = wrapper.querySelector('[role="tablist"]');
    const tabs = wrapper.querySelectorAll('[role="tab"]');
    const panels = wrapper.querySelectorAll('[role="tabpanel"]');

    tabList.addEventListener('click', e => {
      const clickedTab = e.target.closest('[role="tab"]');
      if (!clickedTab) return;

     
      tabs.forEach(tab => {
        tab.setAttribute('aria-selected', 'false');
        tab.classList.remove('tabs__tab_active')
        tab.setAttribute('tabindex', '-1');
      });

      
      clickedTab.setAttribute('aria-selected', 'true');
      clickedTab.classList.add('tabs__tab_active')
      clickedTab.setAttribute('tabindex', '0');

     
      const targetPanelId = clickedTab.getAttribute('aria-controls');
      panels.forEach(panel => {
        panel.hidden = panel.id !== targetPanelId;
      });
    });

    
    tabList.addEventListener('keydown', e => {
      const index = Array.from(tabs).indexOf(document.activeElement);
      if (e.key === 'ArrowRight' && index < tabs.length - 1) tabs[index + 1].focus();
      if (e.key === 'ArrowLeft' && index > 0) tabs[index - 1].focus();
    });
  });
};