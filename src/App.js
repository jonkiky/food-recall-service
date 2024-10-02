import React, { useState } from "react";
import "./App.css";



function App() {
  const [image, setImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  const [apiResponse, setApiResponse] = useState(null);
  const [loading, setLoading] = useState(false);

  // Function to handle the file input change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log(file)
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result); // Create a preview of the image
      };
      reader.readAsDataURL(file); // Read the file as data URL
    }
  };

  // Function to convert the image to base64
  const toBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result.split(",")[1]);
      reader.onerror = (error) => reject(error);
    });
  };

  const handleSubmitMock = async (e)=>{

    e.preventDefault();
    if (!image) {
      alert("Please select an image first!");
      return;
    }
    setLoading(true);
    try {
      // API call using fetch
      const response = await fetch("https://6c03c84d-fe56-4af8-a722-e7bf2edfb914.mock.pstmn.io/mock", {
        method: "GET",
      });

      const data = await response.json();
      console.log(data)
      // Extracting the receipt content
    const receiptText = data.choices[0].message.content;
    const items = receiptText
      .split('\n')
      .filter((line) => line.includes('- $'))
      .map((line) => {
        const [item, price] = line.split(' - ');
        return { item, price };
      });

      setApiResponse(items);
      setLoading(false);
    } catch (error) {
      console.error("Error uploading the image: ", error);
      setLoading(false);
    }

  }



  // Function to handle the form submit and call the API
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!image) {
      alert("Please select an image first!");
      return;
    }

    setLoading(true);

    try {
      // Convert the image file to base64
      const base64Image = await toBase64(image);

      // Define the API payload and headers
      const payload = {
        model: "gpt-4o-mini",
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: "Here is a receipt ,identitied the item listed in the recipet",
              },
              {
                type: "image_url",
                image_url: {
                  url: `data:image/jpeg;base64,${base64Image}`,
                },
              },
            ],
          },
        ],
        max_tokens: 300,
      };

      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer some api keys`, // Replace with your OpenAI API key
      };

      // API call using fetch
      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: headers,
        body: JSON.stringify(payload),
      });

      const data = await response.json();
      setApiResponse(data);
      setLoading(false);
    } catch (error) {
      console.error("Error uploading the image: ", error);
      setLoading(false);
    }
  };

  return (
    <div className="App">
      <h1>Identify Recalled Food In Your Receipt</h1>
      <h1>1. Upload Your Receipt</h1>
      <form onSubmit={handleSubmitMock}>
        <input type="file" onChange={handleImageChange} accept="image/*" />

      {imagePreviewUrl && (
        <>
         <h1>2. Analyze Your Receipt</h1>
         <button type="submit" disabled={loading}>
          {loading ? "Processing..." : "Start Analyze"}
        </button>
        <div>
          <h2>Image Preview:</h2>
          <img
            src={imagePreviewUrl}
            alt="Preview"
            style={{ width: "300px", height: "auto" }}
          />
        </div>
        </>
      )}
       </form>

      {apiResponse && (
        <div>
          <h1>Analyze Result:</h1>
           <div>
      <h2>Items in your receipt content</h2>
      <table border="1" cellPadding="10" style={{ width: '100%' }}>
        <thead>
          <tr>
            <th>#</th>
            <th>Item</th>
            <th>Price</th>
          </tr>
        </thead>
        <tbody>
          {apiResponse.map((row, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>{row.item}</td>
              <td>{row.price}</td>
              <td>
                {index === 2 ? (
                  <span style={{ color: 'red', fontWeight: 'bold' }}>Recalled</span>
                ) : (
                  ''
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>

        </div>
      )}
    </div>
  );
}

export default App;
