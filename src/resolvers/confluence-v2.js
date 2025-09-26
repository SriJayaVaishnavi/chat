// Confluence v2 API implementation following exact documentation
import api, { route } from "@forge/api";

export async function createConfluencePageV2(ticketKey, ticketUrl, issueData, siteUrl) {
  console.log('=== CREATING CONFLUENCE PAGE WITH V2 API ===');
  console.log('Received issueData:', issueData);
  console.log('Ticket Key:', ticketKey);
  console.log('Ticket URL:', ticketUrl);
  
  // Parse issue data to extract summary and next steps
  const lines = issueData.split('\n');
  let title = `KB: ${ticketKey}`;
  let issueSummary = '';
  let nextSteps = '';
  
  // Extract Issue Summary
  const summaryLine = lines.find(line => line.startsWith('Issue Summary:'));
  if (summaryLine) {
    issueSummary = summaryLine.replace('Issue Summary:', '').trim();
    title = issueSummary; // Use the summary as the title
  }
  
  // Extract Next Steps
  const nextStepsLine = lines.find(line => line.startsWith('Next Steps:'));
  if (nextStepsLine) {
    nextSteps = nextStepsLine.replace('Next Steps:', '').trim();
  }
  
  // If we don't have proper parsing, use the full issueData
  const content = issueSummary || issueData;
  const recommendations = nextSteps || 'Please review and add resolution steps.';
  
  // Step 1: Get spaces using v2 API (same as working test function)
  console.log('Getting Confluence spaces...');
  const spacesResponse = await api.asApp().requestConfluence(route`/wiki/api/v2/spaces`, {
    method: 'GET',
    headers: {
      'Accept': 'application/json'
    }
  });
  
  if (!spacesResponse.ok) {
    const errorData = await spacesResponse.json().catch(() => ({}));
    throw new Error(`Cannot access Confluence spaces. Status: ${spacesResponse.status}. ${errorData.message || 'Unknown error'}`);
  }
  
  const spacesData = await spacesResponse.json();
  const spaces = spacesData.results || spacesData.values || [];
  
  if (spaces.length === 0) {
    throw new Error('No Confluence spaces found');
  }
  
  // Step 2: Find target space
  let targetSpace = spaces.find(space => 
    space.key === 'Tickettele' || 
    space.key === 'TICKETTELE' ||
    space.name?.toLowerCase().includes('tickettele')
  );
  
  if (!targetSpace) {
    targetSpace = spaces[0];
  }
  
  console.log('Target space:', {
    id: targetSpace.id,
    key: targetSpace.key,
    name: targetSpace.name
  });
  
  // Step 3: Use v2 API with correct format - ADF as STRING not object
  console.log('Available space data:', targetSpace);
  
  // Create ADF content with full issue details
  const adfContent = JSON.stringify({
    version: 1,
    type: "doc",
    content: [
      {
        type: "heading",
        attrs: { level: 1 },
        content: [
          {
            type: "text",
            text: `Knowledge Base: ${title}`
          }
        ]
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "Related Jira Ticket: ",
            marks: [{ type: "strong" }]
          },
          {
            type: "text",
            text: ticketKey,
            marks: [
              {
                type: "link",
                attrs: {
                  href: ticketUrl
                }
              }
            ]
          }
        ]
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [
          {
            type: "text",
            text: "Issue Summary"
          }
        ]
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: content
          }
        ]
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [
          {
            type: "text",
            text: "Recommended Next Steps"
          }
        ]
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: recommendations
          }
        ]
      },
      {
        type: "heading",
        attrs: { level: 2 },
        content: [
          {
            type: "text",
            text: "Resolution Steps"
          }
        ]
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: "To be updated once the issue is resolved.",
            marks: [{ type: "em" }]
          }
        ]
      },
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: `Created on: ${new Date().toLocaleDateString()} | Source: ${ticketKey}`,
            marks: [{ type: "em" }]
          }
        ]
      }
    ]
  });
  
  // Use the correct v2 payload structure with ADF as string
  const v2PagePayload = {
    spaceId: targetSpace.id,  // Use id, not key for v2
    status: "current",
    title: title,
    body: {
      representation: "atlas_doc_format",
      value: adfContent  // ADF as string, not object
    }
  };
  
  console.log('Creating page with v2 payload (ADF as string):', v2PagePayload);
  
  const createResponse = await api.asApp().requestConfluence(route`/wiki/api/v2/pages`, {
    method: 'POST',
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(v2PagePayload)
  });
  
  console.log('Create response status:', createResponse.status);
  
  if (!createResponse.ok) {
    const errorData = await createResponse.json().catch(() => ({}));
    console.error('v2 API failed:', {
      status: createResponse.status,
      statusText: createResponse.statusText,
      error: errorData,
      fullError: JSON.stringify(errorData)
    });
    
    // Extract detailed error message
    const errorMessage = errorData.message || 
                        errorData.errors?.[0]?.message || 
                        errorData.errors?.[0]?.detail?.message ||
                        errorData.detail || 
                        errorData.reason || 
                        JSON.stringify(errorData);
    
    throw new Error(`Failed to create Confluence page: Status ${createResponse.status} - ${errorMessage}`);
  }
  
  const pageData = await createResponse.json();
  console.log('Successfully created page:', pageData.id);
  
  const pageUrl = `${siteUrl || 'https://srijayavaishnavi7.atlassian.net'}/wiki/spaces/${targetSpace.key}/pages/${pageData.id}`;
  
  return {
    success: true,
    message: 'Successfully created Confluence Knowledge Base page using v2 API',
    articleUrl: pageUrl,
    pageId: pageData.id,
    pageTitle: title,
    spaceKey: targetSpace.key
  };
}
