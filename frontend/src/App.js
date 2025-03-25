import React, { useEffect, useState } from "react";
import axios from "axios";
import './App.css';

function App() {
  const [filters, setFilters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [isModal, setIsModal] = useState(true);
  const [newFilter, setNewFilter] = useState({
    name: "",
    selection: "",
    criteria: [
      {
        type: "Amount",
        selection: "",
        value: "",
        operator: "",
      },
    ],
  });

  // Fetch existing filters
  useEffect(() => {
    const fetchFilters = async () => {
      try {
        const response = await axios.get("http://localhost:8000/api/filters", {
          headers: { "Content-Type": "application/json" },
        });
    
        const processedFilters = response.data.map((filter) => ({
          ...filter,
          criteria: filter.criteria.map((criterion) => {
            if (criterion.type === "Date" && criterion.value) {
              const [day, month, year] = criterion.value.split("-").map(Number); // Convert to integers
              return { ...criterion, day: day, month: month, year: year };
            }
            return criterion;
          }),
        }));
    
        setFilters(processedFilters);
      } catch (error) {
        console.error("Error fetching filters:", error);
        setError(error.message || "An error occurred while fetching filters.");
      } finally {
        setLoading(false);
      }
    };

    fetchFilters();
  }, []);

  // Add new filter
  const handleAddFilter = async (event) => {
    event.preventDefault();
  
    try {
      const response = await axios.post(
        "http://localhost:8000/api/filters",
        newFilter,
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
  
      setFilters((prevFilters) => [...prevFilters, newFilter]);
  
      // Reset the form
      setNewFilter({
        name: "",
        criteria: [
          {
            type: "Amount",
            selection: "",
            value: "",
            operator: "",
          },
        ],
      });
    } catch (error) {
      console.error("Error adding filter:", error);
      setError(error.message || "An error occurred while adding the filter.");
    }
  };

  const handleRemoveFilter = async (filterId) => {
    try {
      await axios.delete(`http://localhost:8000/api/filters/${filterId}`);
      setFilters((prevFilters) => prevFilters.filter((filter) => filter.id !== filterId));
    } catch (error) {
      console.error("Error deleting filter:", error);
      setError("An error occurred while deleting the filter.");
    }
  };

  const handleSubmitFilter = async (event) => {
    event.preventDefault();
  
    try {
      // Convert date fields to "DD-MM-YYYY" format and ensure value is a string
      console.log(newFilter);
      const formattedCriteria = newFilter.criteria.map((criterion) => {
        if (criterion.type === "Date") {
          const { day, month, year, operator, selection } = criterion;
  
          if (day && month && year) {
            return {
              ...criterion,
              value: `${String(day).padStart(2, "0")}-${String(month).padStart(2, "0")}-${year}`,
            };
          }
        }
        return criterion;
      });
  
      const formattedFilter = { ...newFilter, criteria: formattedCriteria };
      
      if (newFilter.id) {
        // If editing an existing filter
        await axios.put(
          `http://localhost:8000/api/filters/${newFilter.id}`,
          formattedFilter,
          { headers: { "Content-Type": "application/json" } }
        );
  
        setFilters((prevFilters) =>
          prevFilters.map((filter) =>
            filter.id === newFilter.id ? formattedFilter : filter
          )
        );
  
      } else {
        // If creating a new filter
        const response = await axios.post(
          "http://localhost:8000/api/filters",
          formattedFilter,
          { headers: { "Content-Type": "application/json" } }
        );
  
        setFilters((prevFilters) => [...prevFilters, formattedFilter]);
      }
  
      // Reset form after submitting
      setNewFilter({
        name: "",
        selection: "",
        criteria: [
          {
            type: "Amount",
            selection: "",
            value: "",
            operator: "",
          },
        ],
      });
      setShowModal(false);
  
    } catch (error) {
      console.error("Error submitting filter:", error);
      setError("An error occurred while submitting the filter.");
    }
  };

  // Handle form input changes
  const handleInputChange = (event, index) => {
    const { name, value } = event.target;
  
    setNewFilter((prevFilter) => {
      if (name === "name") {
        // Ensure name is updated correctly
        return {
          ...prevFilter,
          name: value,
        };
      }

      if (name === "selection") {
        return {
          ...prevFilter,
          selection: value, // Update selection field here
        };
      }
  
      const updatedCriteria = [...prevFilter.criteria];
  
      if (name.startsWith("value_")) {
        // Handle date fields separately
        const field = name.split("_")[1]; // Extract "day", "month", "year"
        updatedCriteria[index] = {
          ...updatedCriteria[index],
          [field]: value, // Store day, month, or year separately
        };
      } else {
        // Handle other fields normally
        updatedCriteria[index] = {
          ...updatedCriteria[index],
          [name]: value,
        };
      }
  
      return {
        ...prevFilter,
        criteria: updatedCriteria,
      };
    });
  };

  // Add new criteria input
  const handleAddCriteria = () => {
    setNewFilter((prevFilter) => ({
      ...prevFilter,
      criteria: [
        ...prevFilter.criteria,
        {
          type: "Amount",
          selection: "",
          value: "",
          operator: "",
        },
      ],
    }));
  };

  // Remove criteria input
  const handleRemoveCriteria = (index) => {
    setNewFilter((prevFilter) => {
      const updatedCriteria = prevFilter.criteria.filter((_, i) => i !== index);
      return {
        ...prevFilter,
        criteria: updatedCriteria,
      };
    });
  };

  const handleEditFilter = (filter) => {
    setNewFilter(filter);
    setShowModal(true);
  };

  const renderCriteriaFields = (criteria, index) => {
    const amountOperators = ['equals', 'greater_than', 'less_than'];
    const titleOperators = ['contains', 'starts_with', 'ends_with'];
    const dateOperators = ['from', 'to'];
  
    // Dynamically set valid operators based on the filter type
    let validOperators = [];
    if (criteria.type === 'Amount') {
      validOperators = amountOperators;
    } else if (criteria.type === 'Title') {
      validOperators = titleOperators;
    } else if (criteria.type === 'Date') {
      validOperators = dateOperators;
    }
  
    return (
      <>
        <div>
          <select
            name="operator"
            value={criteria.operator}
            onChange={(e) => handleInputChange(e, index)}
            required
          >
            <option value="" disabled>Select Operator</option>
            {validOperators.map((operator, idx) => (
              <option key={operator} value={operator}>
                {operator.charAt(0).toUpperCase() + operator.slice(1).replace('_', ' ')}
              </option>
            ))}
          </select>
        </div>
        {criteria.type === "Amount" && (
          <div>
            <input
              type="number"
              name="value"
              value={criteria.value}
              onChange={(e) => handleInputChange(e, index)}
              required
            />
          </div>
        )}
        {criteria.type === "Title" && (
          <div>
            <input
              type="text"
              name="value"
              value={criteria.value}
              onChange={(e) => handleInputChange(e, index)}
              required
            />
          </div>
        )}
        {criteria.type === "Date" && (
          <div className="criteria-row-date">
            <div>
              <select
                name="value_day"
                value={criteria.day || ""}
                onChange={(e) => handleInputChange(e, index)}
                required
              >
                <option value="">DD</option>
                {[...Array(31).keys()].map((i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                name="value_month"
                value={criteria.month || ""}
                onChange={(e) => handleInputChange(e, index)}
                required
              >
                <option value="">MM</option>
                {[...Array(12).keys()].map((i) => (
                  <option key={i} value={i + 1}>
                    {i + 1}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <select
                name="value_year"
                value={criteria.year || ""}
                onChange={(e) => handleInputChange(e, index)}
                required
              >
                <option value="">YYYY</option>
                {[...Array(50).keys()].map((i) => (
                  <option key={i} value={2025 - i}>
                    {2025 - i}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}
      </>
    );
  };

  if (loading) return <div>Loading filters...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div>
      <h1>Filters</h1>
      <button onClick={() => setIsModal(!isModal)}>{isModal ? 'Switch to Non-Modal' : 'Switch to Modal'}</button>
      <button onClick={() => setShowModal(true)}>Add Filter</button>

      {/* Non-Modal Mode - Embedded Filter Form */}
      {!isModal && (
        <div className="filter-form">
          <h2>{newFilter.id ? "Edit Filter" : "Add a New Filter"}</h2>
          <form onSubmit={handleSubmitFilter}>
            <div>
              <label>Name: </label>
              <input
                type="text"
                name="name"
                value={newFilter.name}
                onChange={(e) => handleInputChange(e)}
                required
              />
            </div>
            <div>
              <h3>Criteria</h3>
              {newFilter.criteria.map((criteria, index) => (
                <div key={index}>
                  <div>
                    <label>Type: </label>
                    <select
                      name="type"
                      value={criteria.type}
                      onChange={(e) => handleInputChange(e, index)}
                      required
                    >
                      <option value="Amount">Amount</option>
                      <option value="Title">Title</option>
                      <option value="Date">Date</option>
                    </select>
                  </div>
                  {renderCriteriaFields(criteria, index)}
                  <button type="button" onClick={() => handleRemoveCriteria(index)}>
                    Remove Criteria
                  </button>
                </div>
              ))}
              <button type="button" onClick={handleAddCriteria}>
                Add Criteria
              </button>
            </div>
            <button type="submit">{newFilter.id ? "Update Filter" : "Add Filter"}</button>
          </form>
        </div>
      )}

      {/* Filter Modal Dialog */}
      {isModal && showModal && (
        <div className="modal">
          <div className="modal-header">
            <h2>{newFilter.id ? "Edit Filter" : "Add a New Filter"}</h2>
            <button 
              className="close-button" 
              onClick={() => setShowModal(false)}
              aria-label="Close Modal"
            >
              &times;
            </button>
          </div>
          <div className="modal-content">
            <form onSubmit={handleSubmitFilter}>
              
              <div className="modal-content-form">
                <div className="modal-content__name">
                  <label>Filter Name</label>
                  <input
                    type="text"
                    name="name"
                    value={newFilter.name}
                    onChange={(e) => handleInputChange(e)}
                    required
                  />
                </div>
                <div className="modal-content__criteria">
                  <div>
                    <label>Criteria</label>
                    {newFilter.criteria.map((criteria, index) => (
                      <div key={index} className="criteria-row">
                        <div>
                          <select
                            name="type"
                            value={criteria.type}
                            onChange={(e) => handleInputChange(e, index)}
                            required
                          >
                            <option value="Amount">Amount</option>
                            <option value="Title">Title</option>
                            <option value="Date">Date</option>
                          </select>
                        </div>

                        {renderCriteriaFields(criteria, index)}

                        <button type="button" onClick={() => handleRemoveCriteria(index)}>
                          -
                        </button>
                      </div>
                    ))}
                  </div>
                  <button type="button" onClick={handleAddCriteria}>
                    Add Criteria
                  </button>
                </div>
                <div className="modal-content__selection">
                  <label>Filter Selection</label>
                  <select
                    name="selection"
                    value={newFilter.selection || ""}
                    onChange={(e) => handleInputChange(e)}
                    required
                  >
                    <option value="" disabled>Select Selection</option>
                    <option value="1">Option 1</option>
                    <option value="2">Option 2</option>
                    <option value="3">Option 3</option>
                  </select>
                </div>
              </div>

              <div className="modal-footer">
                <button onClick={() => setShowModal(false)}>Close</button>
                <button type="submit">
                  {newFilter.id ? "Update Filter" : "Add Filter"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <h2>Existing Filters</h2>
      {filters.length === 0 ? (
        <p>No filters available</p>
      ) : (
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filters
              .sort((a, b) => a.id - b.id)
              .map((filter) => (
              <tr key={filter.id}>
                <td>{filter.name}</td>
                <td>
                  <button onClick={() => handleEditFilter(filter)}>Edit</button>
                  <button onClick={() => handleRemoveFilter(filter.id)}>Remove</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default App;
