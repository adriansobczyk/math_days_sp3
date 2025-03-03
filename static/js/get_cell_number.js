document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('player_id').addEventListener('change', function() {
      var playerId = this.value;
      if (playerId) {
        fetch('/get_cell_number/' + playerId)
          .then(response => response.json())
          .then(data => {
            var cellNumberInput = document.getElementById('cell_number');
            if (data.cell_number !== null) {
              cellNumberInput.value = data.cell_number;
            } else {
              cellNumberInput.value = '';
            }
          });
      } else {
        var cellNumberInput = document.getElementById('cell_number');
        cellNumberInput.value = '';
      }
    });
  });