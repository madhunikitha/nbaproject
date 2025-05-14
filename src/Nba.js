import React, { useState} from 'react';
import { useEffect } from 'react';
import './Nba.css';


function Nba() {
  

  const [selectedType, setSelectedType] = useState('');
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);
  const [filterCriteria, setFilterCriteria] = useState({
    author: '',
    fromYear: '',
    toYear: '',
    indexing: '',
    circulation: '',//national,international
    dept: '' // Added dept field for branch selection
  });

  
  const [authors, setAuthors] = useState([]);

  useEffect(() => {
    // Fetch the list of authors when the component mounts
    fetch('http://localhost:8081/authors')
      .then(res => res.json())
      .then(data => setAuthors(data))
      .catch(err => console.error('Error fetching authors:', err));
  }, []);

  const handleFilterChange = (event) => {
    const { name, value } = event.target;
    setFilterCriteria((prevCriteria) => ({
      ...prevCriteria,
      [name]: value,
    }));
  };

  const handleAuthorChange = (event, value) => {
    setFilterCriteria((prevCriteria) => ({
      ...prevCriteria,
      author: value,
    }));
  };
  const handleDownloadPdf = () => {
    window.print();
  };
  
  const applyFilters = async () => {
    try {
      const res = await fetch('http://localhost:8081/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filterCriteria),
      });
      const responseData = await res.json();
      console.log('Data from server:', responseData);
      setData(responseData);
    } catch (error) {
      console.log('Error sending data to server:', error);
      setError('Error fetching data from server');
    }
  };

  return (
    <div className="container">
    <div className="top-controls">
          <label>Author</label>
          <input
            type="text"
            placeholder="Filter by author"
            name="author"
            value={filterCriteria.author}
            onChange={handleFilterChange}
          />
          </div>
      <div className="mb-3">
        <label>From</label>
        <input
          type="number"
          placeholder="From Year"
          name="fromYear"
          value={filterCriteria.fromYear}
          onChange={handleFilterChange}
        />
      </div>
      <div className="mb-3">
        <label>To</label>
        <input
          type="number"
          placeholder="To Year"
          name="toYear"
          value={filterCriteria.toYear}
          onChange={handleFilterChange}
        />
      </div>
      <div className="mb-3 text-right">
        <label htmlFor="indexing">Indexing</label>
        <select
          id="indexing"
          className="form-select"
          name="indexing"
          value={filterCriteria.indexing}
          onChange={handleFilterChange}
        >
          <option value="" disabled>select type of paper</option>
          <option value="scopus">scopus</option>
          <option value="webOfScience">webOfScience</option>
          <option value="SCI">SCI</option>
          <option value="GoogleScholar">GoogleScholar</option>
          <option value="UGCRated">UGCRated</option>
          <option value="all">all</option>
        </select>
      </div>
      <div className="mb-3 text-right">
        <label htmlFor="circulation">Level Of Circulation</label>
        <select
          id="circulation"
          className="form-select"
          name="circulation"
          value={filterCriteria.circulation}
          onChange={handleFilterChange}
        >
          <option value="" disabled>select level of circulation</option>
          <option value="National">national</option>
          <option value="International">international</option>
          <option value="both">both</option>
        </select>
      </div>
      <div className="mb-3 text-right">
        <label htmlFor="dept">Branch</label>
        <select
          id="dept"
          className="form-select"
          name="dept"
          value={filterCriteria.dept}
          onChange={handleFilterChange}
        >
          <option value="" disabled>select branch</option>
          <option value="cse">CSE</option>
          <option value="csbs">CSBS</option>
          <option value="csm">CSM</option>
          <option value="csd">CSD</option>
          <option value="csc">CSC</option>
          <option value="ec">EC</option>
          <option value="eee">EEE</option>
          <option value="IT">IT</option>
        </select>
      </div>
      <button type="button" onClick={applyFilters}>Apply Filters</button>
      {error && <div className="error">{error}</div>}
      {data.length > 0 && (
        <div>
          <table className="table container">
            <thead>
              <tr>
                <th>S.no</th>
                <th>Name of Authors</th>
                <th>Title of the Paper/Book Chapter/Books</th>
                <th>Title of the Journal/Title of the Conference/Title of Book</th>
                <th>Date</th>
                <th>Indexing (SCI/SCOPUS/WoS/UGC/refereed Journals)</th>
                <th>ISBN/ISSN</th>
                <th>Level Of Circulation</th>
                <th>URL</th>
              </tr>
            </thead>
            <tbody>
              {data.map((d, index) => (
                <tr key={d.id || index}>
                  <td>{index + 1}</td>
                  <td>
                    {[d.Author_ID1, d.Author_ID2, d.Author_ID3, d.Author_ID4, d.Author_ID5, d.Author_ID6, d.Author_ID7]
                      .filter(id => id) // Remove any falsy values
                      .join(', ')}
                  </td>
                  <td>{d.publicationTitle}</td>
                  <td>{d.publicationType === 'Conference' ? d.conferenceName : d.journalName}</td>
                  <td>{d.dateOfPublication}</td>
                  <td>
                    {d.scopus === 'yes' ? 'scopus ' : ''}
                    {d.webOfScience === 'yes' ? 'webOfScience ' : ''}
                    {d.SCI === 'yes' ? 'SCI ' : ''}
                    {d.GoogleScholar === 'yes' ? 'GoogleScholar ' : ''}
                    {d.UGCRated === 'yes' ? 'UGCRated ' : ''}
                  </td>
                  <td>{d.ISSNnumber}</td>
                  <td>{d.levelOfCirculation}</td>
                  <td>
                    {d.proof ? (
                      <a href={d.proof} target="_blank" rel="noopener noreferrer">
                        {d.proof}
                      </a>
                    ) : (
                      'No proof available'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <button className="print-hide" onClick={handleDownloadPdf}>Print Report</button>
          
        </div>
      )}
    </div>
  );
}

export default Nba;
