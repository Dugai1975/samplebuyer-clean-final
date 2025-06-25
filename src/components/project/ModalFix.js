// This script fixes modal positioning issues on mobile devices
// It should be imported in components that use modals

if (typeof window !== 'undefined') {
  // Add a class to the body when a modal is opened
  const originalBodyStyle = document.body.style.cssText || '';
  
  // Override Ant Design's modal positioning for mobile
  const fixModalPositioning = () => {
    const isMobile = window.innerWidth < 600;
    
    if (isMobile) {
      // Find all modal wrappers
      const modalWrappers = document.querySelectorAll('.ant-modal-wrap');
      
      modalWrappers.forEach(wrapper => {
        // Add mobile-specific classes
        wrapper.classList.add('mobile-modal-wrap');
        
        // Find the modal within this wrapper
        const modal = wrapper.querySelector('.ant-modal');
        if (modal) {
          modal.style.width = '94%';
          modal.style.maxWidth = '94%';
          modal.style.margin = '0 auto';
          modal.style.top = '50%';
          modal.style.transform = 'translateY(-50%)';
        }
      });
    }
  };
  
  // Run on load and resize
  window.addEventListener('resize', fixModalPositioning);
  
  // Create a MutationObserver to detect when modals are added to the DOM
  if (typeof MutationObserver !== 'undefined') {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length > 0) {
          // Check if any of the added nodes are modal wrappers
          mutation.addedNodes.forEach((node) => {
            if (node.classList && node.classList.contains('ant-modal-wrap')) {
              fixModalPositioning();
            }
          });
        }
      });
    });
    
    // Start observing the document body for modal additions
    observer.observe(document.body, { childList: true, subtree: true });
  }
  
  // Run once on initial load
  if (document.readyState === 'complete') {
    fixModalPositioning();
  } else {
    window.addEventListener('load', fixModalPositioning);
  }
}

export default {};
