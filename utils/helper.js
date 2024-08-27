function getOffSet(currentPage = 1, listPerPage) {
  return (currentPage - 1) * listPerPage;
}

function emptyOrRows(rows) {
  if (!rows) {
    return [];
  }
  return rows;
}

module.exports = {
  getOffSet,
  emptyOrRows,
};
