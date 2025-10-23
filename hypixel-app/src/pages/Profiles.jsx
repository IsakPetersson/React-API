import { useState } from "react";
import Players from "../components/Players";

export default function Profiles() {
  const [playerData, setPlayerData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [apiKey, setApiKey] = useState("");
  const [useMockData, setUseMockData] = useState(false);
  const [profilesList, setProfilesList] = useState([]);
  const [selectedProfileId, setSelectedProfileId] = useState(null);

  const handleProfileSelection = async (profileId) => {
    if (!apiKey.trim() || !profileId) return;
    
    setLoading(true);
    setError(null);
    setPlayerData(null);
    setSelectedProfileId(profileId);

    try {
      const corsProxies = [
        'https://api.allorigins.win/raw?url=',
        'https://corsproxy.io/?',
        'https://cors-anywhere.herokuapp.com/',
        'https://thingproxy.freeboard.io/fetch/',
        'https://api.codetabs.com/v1/proxy?quest='
      ];

      // Try to get detailed profile data with fallback proxies
      let profileData;
      for (let i = 0; i < corsProxies.length; i++) {
        try {
          const profileUrl = encodeURIComponent(`https://api.hypixel.net/v2/skyblock/profile?key=${apiKey}&profile=${profileId}`);
          const fullUrl = corsProxies[i] + profileUrl;
          console.log(`Trying CORS proxy ${i + 1} for profile details:`, fullUrl);
          
          // Add timeout to prevent hanging
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 10000);
          
          const profileResponse = await fetch(fullUrl, {
            signal: controller.signal,
            headers: {
              'Accept': 'application/json',
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
            }
          });
          
          clearTimeout(timeoutId);
          console.log(`Profile details response status:`, profileResponse.status, profileResponse.statusText);
          
          if (profileResponse.ok) {
            profileData = await profileResponse.json();
            console.log(`Successfully got profile details:`, profileData);
            break;
          } else {
            console.log(`Profile details fetch failed with status:`, profileResponse.status);
          }
        } catch (err) {
          console.log(`CORS proxy ${i + 1} failed for profile fetch:`, err.message);
          if (i === corsProxies.length - 1) {
            throw new Error(`Failed to fetch profile details. All CORS proxies failed. Try again later or use mock data.`);
          }
        }
      }
      
      if (!profileData) {
        throw new Error('Failed to fetch profile details');
      }
      
      if (!profileData.success) {
        if (profileData.cause === 'Invalid API key') {
          throw new Error('Invalid API key. Please check your API key or use mock data for testing.');
        }
        throw new Error(profileData.cause || 'Profile API request failed');
      }

      // Find the profile info from the list
      const selectedProfile = profilesList.find(p => p.profile_id === profileId);
      
      setPlayerData({
        ign: selectedProfile?.cute_name || 'Unknown',
        uuid: selectedProfile?.uuid || 'Unknown',
        profile: profileData.profile,
        profileName: profileData.profile.cute_name || selectedProfile?.cute_name || 'Unknown Profile'
      });
    } catch (err) {
      console.error('Profile selection error:', err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handlePlayerSearch = async (ign) => {
    if (!useMockData && !apiKey.trim()) {
      setError("Please enter your Hypixel API key first or enable mock data");
      return;
    }

    setLoading(true);
    setError(null);
    setPlayerData(null);

    try {
      if (useMockData) {
        // Simulate API delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock Skyblock data
        const mockProfile = {
          cute_name: "Test Profile",
          last_save: Date.now(),
          coin_purse: 1000000,
          banking: { balance: 500000 },
          inv_contents: {
            data: [
              { material: "DIAMOND_SWORD", amount: 1, display_name: "Sharp Diamond Sword", rarity: "RARE" },
              { material: "DIAMOND_PICKAXE", amount: 1, display_name: "Efficiency Pickaxe", rarity: "EPIC" },
              { material: "GOLDEN_APPLE", amount: 5, display_name: "Golden Apple", rarity: "UNCOMMON" },
              { material: "ENDER_PEARL", amount: 16, display_name: "Ender Pearl", rarity: "COMMON" },
              { material: "BOW", amount: 1, display_name: "Power Bow", rarity: "RARE" },
              { material: "ARROW", amount: 64, display_name: "Arrow", rarity: "COMMON" },
              { material: "POTION", amount: 3, display_name: "Healing Potion", rarity: "UNCOMMON" },
              { material: "BREAD", amount: 10, display_name: "Bread", rarity: "COMMON" },
              { material: "DIAMOND", amount: 32, display_name: "Diamond", rarity: "COMMON" },
              { material: "IRON_INGOT", amount: 128, display_name: "Iron Ingot", rarity: "COMMON" },
              { material: "GOLD_INGOT", amount: 64, display_name: "Gold Ingot", rarity: "COMMON" },
              { material: "EMERALD", amount: 16, display_name: "Emerald", rarity: "COMMON" }
            ]
          }
        };

        setPlayerData({
          ign: ign,
          uuid: "12345678-1234-1234-1234-123456789abc",
          profile: mockProfile,
          profileName: mockProfile.cute_name
        });
      } else {
        // Real API calls with multiple CORS proxy fallbacks
        const corsProxies = [
          'https://api.allorigins.win/raw?url=',
          'https://corsproxy.io/?',
          'https://cors-anywhere.herokuapp.com/',
          'https://thingproxy.freeboard.io/fetch/',
          'https://api.codetabs.com/v1/proxy?quest='
        ];
        
        let uuidResponse, uuidData, uuid;
        
        // Try to get UUID with fallback proxies
        for (let i = 0; i < corsProxies.length; i++) {
          try {
            const mojangUrl = encodeURIComponent(`https://api.mojang.com/users/profiles/minecraft/${ign}`);
            const fullUrl = corsProxies[i] + mojangUrl;
            console.log(`Trying CORS proxy ${i + 1} for UUID:`, fullUrl);
            
            uuidResponse = await fetch(fullUrl);
            console.log(`UUID response status:`, uuidResponse.status, uuidResponse.statusText);
            
            if (uuidResponse.ok) {
              uuidData = await uuidResponse.json();
              uuid = uuidData.id;
              console.log(`Successfully got UUID:`, uuid);
              break;
            } else {
              console.log(`UUID fetch failed with status:`, uuidResponse.status);
            }
          } catch (err) {
            console.log(`CORS proxy ${i + 1} failed for UUID fetch:`, err.message);
            if (i === corsProxies.length - 1) {
              throw new Error(`Failed to fetch player UUID. All CORS proxies failed. Try using mock data or check your internet connection.`);
            }
          }
        }
        
        if (!uuid) {
          throw new Error('Player not found or CORS proxy issues');
        }

        // Try to get profiles with fallback proxies
        let profilesData;
        for (let i = 0; i < corsProxies.length; i++) {
          try {
            const profilesUrl = encodeURIComponent(`https://api.hypixel.net/v2/skyblock/profiles?key=${apiKey}&uuid=${uuid}`);
            const fullUrl = corsProxies[i] + profilesUrl;
            console.log(`Trying CORS proxy ${i + 1} for profiles:`, fullUrl);
            
            // Add timeout to prevent hanging
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout
            
            const profilesResponse = await fetch(fullUrl, {
              signal: controller.signal,
              headers: {
                'Accept': 'application/json',
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            });
            
            clearTimeout(timeoutId);
            console.log(`Profiles response status:`, profilesResponse.status, profilesResponse.statusText);
            
            if (profilesResponse.ok) {
              profilesData = await profilesResponse.json();
              console.log(`Successfully got profiles data:`, profilesData);
              break;
            } else {
              console.log(`Profiles fetch failed with status:`, profilesResponse.status);
            }
          } catch (err) {
            console.log(`CORS proxy ${i + 1} failed for profiles fetch:`, err.message);
            if (i === corsProxies.length - 1) {
              throw new Error(`Failed to fetch profiles. All CORS proxies failed. This might be due to rate limiting, network issues, or QUIC protocol errors. Try again later or use mock data.`);
            }
          }
        }
        
        if (!profilesData) {
          throw new Error('Failed to fetch player profiles');
        }
        
        if (!profilesData.success) {
          if (profilesData.cause === 'Invalid API key') {
            throw new Error('Invalid API key. Please check your API key or use mock data for testing.');
          }
          throw new Error(profilesData.cause || 'API request failed');
        }

        // Get the profiles list
        const profiles = profilesData.profiles;
        if (!profiles || profiles.length === 0) {
          throw new Error('No Skyblock profiles found for this player');
        }

        // Store profiles list for selection
        setProfilesList(profiles);
        
        // Find the most recent profile (highest last_save timestamp)
        const mostRecentProfile = profiles.reduce((latest, current) => {
          return current.last_save > latest.last_save ? current : latest;
        });
        
        // Set the most recent profile as default selection
        setSelectedProfileId(mostRecentProfile.profile_id);
        
        // Show success message and let user select profile
        setError(null);
        console.log(`Found ${profiles.length} profiles for ${ign}. Please select a profile to view details.`);
      }
    } catch (err) {
      console.error('Full error object:', err);
      console.error('Error message:', err.message);
      console.error('Error stack:', err.stack);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="center-container">
      <h1 className="text-center mb-4 mainTitle">Skyblock Inventory Viewer</h1>
      
      <div className="alert alert-info" role="alert">
        <strong>Note:</strong> {useMockData ? "Using mock data for testing." : "This uses CORS proxies to access the Hypixel API. If it fails, try again or use mock data."}
      </div>
      
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">API Configuration</h5>
          <div className="mb-3">
            <div className="form-check mb-3">
              <input
                className="form-check-input"
                type="checkbox"
                id="useMockData"
                checked={useMockData}
                onChange={(e) => setUseMockData(e.target.checked)}
              />
              <label className="form-check-label" htmlFor="useMockData">
                Use mock data for testing
              </label>
            </div>
            
            {!useMockData && (
              <>
                <label htmlFor="apiKey" className="form-label">Hypixel API Key</label>
                <input
                  type="text"
                  id="apiKey"
                  className="form-control"
                  placeholder="Enter your Hypixel API key..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
                <div className="form-text">
                  Get your API key from <a href="https://api.hypixel.net/" target="_blank" rel="noopener noreferrer">hypixel.net</a>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="card-title">Search Player</h5>
          <form onSubmit={(e) => {
            e.preventDefault();
            const ign = e.target.ign.value.trim();
            if (ign) {
              handlePlayerSearch(ign);
            }
          }}>
            <div className="input-group">
              <input
                type="text"
                name="ign"
                className="form-control"
                placeholder="Enter Minecraft IGN..."
                disabled={loading}
              />
              <button 
                className="btn btn-primary" 
                type="submit"
                disabled={loading || (!useMockData && !apiKey.trim())}
              >
                {loading ? "Searching..." : "Search"}
              </button>
            </div>
          </form>
          
          {/* Debug buttons */}
          <div className="mt-3">
            <button 
              className="btn btn-sm btn-outline-secondary me-2"
              onClick={() => {
                console.log('Testing CORS proxy 1...');
                fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent('https://api.mojang.com/users/profiles/minecraft/Dream'))
                  .then(res => {
                    console.log('CORS proxy 1 response:', res.status, res.statusText);
                    return res.text();
                  })
                  .then(text => console.log('CORS proxy 1 response text:', text))
                  .catch(err => console.error('CORS proxy 1 error:', err));
              }}
            >
              Test CORS Proxy 1
            </button>
            <button 
              className="btn btn-sm btn-outline-secondary me-2"
              onClick={() => {
                console.log('Testing CORS proxy 3...');
                fetch('https://corsproxy.io/?https://api.mojang.com/users/profiles/minecraft/Dream')
                  .then(res => {
                    console.log('CORS proxy 3 response:', res.status, res.statusText);
                    return res.text();
                  })
                  .then(text => console.log('CORS proxy 3 response text:', text))
                  .catch(err => console.error('CORS proxy 3 error:', err));
              }}
            >
              Test CORS Proxy 3
            </button>
            <button 
              className="btn btn-sm btn-outline-secondary me-2"
              onClick={() => {
                console.log('Testing CORS proxy 4...');
                fetch('https://thingproxy.freeboard.io/fetch/https://api.mojang.com/users/profiles/minecraft/Dream')
                  .then(res => {
                    console.log('CORS proxy 4 response:', res.status, res.statusText);
                    return res.text();
                  })
                  .then(text => console.log('CORS proxy 4 response text:', text))
                  .catch(err => console.error('CORS proxy 4 error:', err));
              }}
            >
              Test CORS Proxy 4
            </button>
            <button 
              className="btn btn-sm btn-outline-secondary me-2"
              onClick={() => {
                console.log('Testing CORS proxy 5...');
                fetch('https://api.codetabs.com/v1/proxy?quest=https://api.mojang.com/users/profiles/minecraft/Dream')
                  .then(res => {
                    console.log('CORS proxy 5 response:', res.status, res.statusText);
                    return res.text();
                  })
                  .then(text => console.log('CORS proxy 5 response text:', text))
                  .catch(err => console.error('CORS proxy 5 error:', err));
              }}
            >
              Test CORS Proxy 5
            </button>
            <button 
              className="btn btn-sm btn-outline-warning"
              onClick={() => {
                if (!apiKey.trim()) {
                  alert('Please enter your API key first');
                  return;
                }
                console.log('Testing Hypixel API directly...');
                const testUrl = `https://api.hypixel.net/v2/skyblock/profiles?key=${apiKey}&uuid=ec70bcaf702f4bb8b48d276fa52a780c`;
                console.log('Testing URL:', testUrl);
                fetch('https://api.allorigins.win/raw?url=' + encodeURIComponent(testUrl))
                  .then(res => {
                    console.log('Hypixel API response:', res.status, res.statusText);
                    return res.text();
                  })
                  .then(text => {
                    console.log('Hypixel API response text:', text);
                    try {
                      const data = JSON.parse(text);
                      console.log('Parsed Hypixel data:', data);
                    } catch (e) {
                      console.log('Could not parse as JSON:', e);
                    }
                  })
                  .catch(err => console.error('Hypixel API error:', err));
              }}
            >
              Test Hypixel API
            </button>
          </div>
        </div>
      </div>
      
      {error && (
        <div className="alert alert-danger mt-3" role="alert">
          <strong>Error:</strong> {error}
          <hr />
          <small>
            <strong>Troubleshooting:</strong>
            <ul className="mb-0 mt-2">
              <li>Check your internet connection</li>
              <li>Verify your API key is correct</li>
              <li>Try using mock data for testing</li>
              <li>CORS proxies may be temporarily unavailable</li>
            </ul>
          </small>
        </div>
      )}
      
      {/* Profile Selector */}
      {profilesList.length > 0 && (
        <div className="card mb-4">
          <div className="card-body">
            <h5 className="card-title">Select Profile</h5>
            <p className="text-muted">Choose which profile to view:</p>
            <div className="row">
              {profilesList.map((profile, index) => (
                <div key={profile.profile_id} className="col-md-6 col-lg-4 mb-3">
                  <div 
                    className={`card h-100 cursor-pointer ${selectedProfileId === profile.profile_id ? 'border-primary' : 'border-secondary'}`}
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleProfileSelection(profile.profile_id)}
                  >
                    <div className="card-body">
                      <h6 className="card-title">
                        {profile.cute_name || `Profile ${index + 1}`}
                        {selectedProfileId === profile.profile_id && (
                          <span className="badge bg-primary ms-2">Selected</span>
                        )}
                      </h6>
                      <p className="card-text small">
                        <strong>Last Save:</strong> {new Date(profile.last_save).toLocaleString()}<br/>
                        <strong>Profile ID:</strong> {profile.profile_id}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {playerData && (
        <Players playerData={playerData} />
      )}
    </div>
  );
}