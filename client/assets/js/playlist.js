document.querySelectorAll('[data-type=song]').forEach((checkbox) => {
  checkbox.addEventListener('change', selectSong);
});

async function selectSong(event) {
  const songId = event.target.getAttribute('data-song');
  const action = event.target.checked ? 'select' : 'deselect';  

  const response = await fetch(`/playlist/${songId}/select?action=${action}`, {
    method: 'POST',
  });
  const data = await response.json();
  
  const totalSelected = document.querySelector('#total-selected');
  if (totalSelected) {
    totalSelected.textContent = data.totalSelected;
  }

  console.log(data);
}
