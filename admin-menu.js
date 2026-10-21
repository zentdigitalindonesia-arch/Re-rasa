const adminToggle=document.querySelector('#adminMenuToggle'),adminNav=document.querySelector('#adminNavigation');
function adminMenu(open){document.body.classList.toggle('admin-menu-open',open);adminToggle.setAttribute('aria-expanded',String(open));adminNav.inert=!open;if(open)adminNav.querySelector('a').focus();else adminToggle.focus()}
adminToggle.onclick=()=>adminMenu(adminToggle.getAttribute('aria-expanded')!=='true');
document.querySelector('#adminScrim').onclick=()=>adminMenu(false);
adminNav.addEventListener('click',e=>{if(e.target.closest('a'))adminMenu(false)});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&adminToggle.getAttribute('aria-expanded')==='true')adminMenu(false);if(e.key==='Tab'&&adminToggle.getAttribute('aria-expanded')==='true'){const links=adminNav.querySelectorAll('a');if(!e.shiftKey&&document.activeElement===links[links.length-1]){e.preventDefault();adminToggle.focus()}else if(e.shiftKey&&document.activeElement===adminToggle){e.preventDefault();links[links.length-1].focus()}}});
