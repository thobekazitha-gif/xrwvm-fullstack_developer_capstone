import React, { useState, useEffect } from 'react';
import "./Dealers.css";
import "../assets/style.css";
import Header from '../Header/Header';
import review_icon from "../assets/reviewicon.png";

const Dealers = () => {
  const [dealersList, setDealersList] = useState([]);
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const dealer_url = "/djangoapp/get_dealers";
  
  const filterDealers = async (state) => {
    try {
      setLoading(true);
      setError(null);
      
      // Correct URL construction by state
      const url = state === "All" ? dealer_url : `${dealer_url}/${state}`;
      const res = await fetch(url, { method: "GET" });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const retobj = await res.json();
      
      if(retobj.status === 200 && Array.isArray(retobj.dealers)) {
        setDealersList(retobj.dealers);
      } else {
        setDealersList([]);
      }
    } catch (err) {
      console.error("Error filtering dealers:", err);
      setError("Failed to filter dealers. Please try again.");
      setDealersList([]);
    } finally {
      setLoading(false);
    }
  };

  const get_dealers = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const res = await fetch(dealer_url, { method: "GET" });
      
      if (!res.ok) {
        throw new Error(`HTTP error! status: ${res.status}`);
      }
      
      const retobj = await res.json();
      
      if(retobj.status === 200 && Array.isArray(retobj.dealers)) {
        let all_dealers = Array.from(retobj.dealers);
        let states_list = [];
        
        all_dealers.forEach((dealer) => {
          if (dealer.state) {
            states_list.push(dealer.state);
          }
        });
        
        setStates(Array.from(new Set(states_list)));
        setDealersList(all_dealers);
      } else {
        throw new Error("Invalid response format");
      }
    } catch (err) {
      console.error("Error fetching dealers:", err);
      setError("Failed to load dealers. Please refresh the page.");
      setDealersList([]);
      setStates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    get_dealers();
  }, []); 

  let isLoggedIn = sessionStorage.getItem("username") != null;

  return(
    <div>
      <Header/>
      
      {error && (
        <div className="error-message" style={{
          padding: '15px',
          margin: '20px',
          backgroundColor: '#f8d7da',
          color: '#721c24',
          border: '1px solid #f5c6cb',
          borderRadius: '4px'
        }}>
          {error}
        </div>
      )}
      
      {loading ? (
        <div style={{ padding: '20px', textAlign: 'center' }}>
          Loading dealers...
        </div>
      ) : (
        <table className='table'>
          <thead>
            <tr>
              <th>ID</th>
              <th>Dealer Name</th>
              <th>City</th>
              <th>Address</th>
              <th>Zip</th>
              <th>
                <select name="state" id="state" onChange={(e) => filterDealers(e.target.value)}>
                  <option value="" disabled hidden>State</option>
                  <option value="All">All States</option>
                  {states.map((state, index) => (
                    <option key={index} value={state}>{state}</option>
                  ))}
                </select>
              </th>
              {isLoggedIn && <th>Review Dealer</th>}
            </tr>
          </thead>
          <tbody>
            {dealersList.length === 0 ? (
              <tr>
                <td colSpan={isLoggedIn ? "7" : "6"} style={{ textAlign: 'center', padding: '20px' }}>
                  No dealers found
                </td>
              </tr>
            ) : (
              dealersList.map(dealer => (
                <tr key={dealer.id}>
                  <td>{dealer.id}</td>
                  <td>
                    <a href={'/dealer/' + dealer.id}>
                      {dealer.full_name || 'N/A'}
                    </a>
                  </td>
                  <td>{dealer.city || 'N/A'}</td>
                  <td>{dealer.address || 'N/A'}</td>
                  <td>{dealer.zip || 'N/A'}</td>
                  <td>{dealer.state || 'N/A'}</td>
                  {isLoggedIn && (
                    <td>
                      <a href={`/postreview/${dealer.id}`}>
                        <img src={review_icon} className="review_icon" alt="Post Review"/>
                      </a>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default Dealers;