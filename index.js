(function() {

  /**
   * Search Repo Files
   */
  function searchRepoFiles(searchWord, repoName) {
    return new Promise(
      function(resolve, reject) {
        const url = `https://api.github.com/search/code?q=${searchWord}+in:file+language:js+repo:${repoName}`;
        const request = new XMLHttpRequest();

        request.onreadystatechange = function() {
          if (request.readyState === 4) {
            if (request.status === 200) {
              resolve(JSON.parse(request.responseText));
            } else {
              reject(`Error: ${request.status}`);
            }
          }
        };
        request.open('GET', url);
        request.send(null);
      }
    );
  }

  /**
   * Render
   */
  function render(props) {
    console.log(props.filesInRepos);
    const content = props.filesInRepos.length === 0 ?
      `<h3>No Results</h3>` :
      props.filesInRepos.map(function(filesInRepo) {
        return (`
          <li class="repo">
            <h2>${filesInRepo[0].repository.full_name}</h2>
            <ul>
            ${filesInRepo.map(function(fileInRepo) {
                return (`<li><a href="${fileInRepo.html_url}" target="_blank">${fileInRepo.path}</a></li>`)
              }).join('\n')
            }
            </ul>
          </li>
        `)
      });

    document.getElementById('app').innerHTML = content;
  }

  /**
   * Load Data
   */
  function loadData(repos) {
    const filesInRepos = [];
    repos.forEach(function(repo, repoIndex) {
      searchRepoFiles('// TODO:', repo.full_name)
        .then(function(files) {
          if (files.items)
            filesInRepos.push(files.items);
          if (repoIndex === repos.length - 1)
            render({ filesInRepos });
        });
    });
  }

  /**
   * Submit Search
   */
  function submitSearch(input) {
    const reposArray = [{ full_name: input.value }];
    loadData(reposArray);
    input.value = '';
  }

  /**
   * Search Handler
   */
  function searchHandler(e) {
    if (loadTimeout) clearTimeout(loadTimeout);
    e.target.value = e.target.value.replace(/[' ']/g, '');
    if (e.which == 13 || e.keyCode == 13) {
      e.preventDefault();
      submitSearch(e.target);
    } else {
      if (e.target.value.match(/\/(?=\w)/)) {
        loadTimeout = setTimeout(function() { submitSearch(e.target) }, 1000);
      }
    }
  }

  /**
   * Init
   */
  var loadTimeout;
  const searchInput = document.querySelector('[name=search]');

  searchInput.focus();
  searchInput.addEventListener('keyup', searchHandler, false);

})();
