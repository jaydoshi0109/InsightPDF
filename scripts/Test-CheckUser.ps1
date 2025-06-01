# Test the check-user endpoint with a sample user ID
$userId = "user_2xhYQdUhpK2oHrzEybpts4xRZW4"
$url = "http://localhost:3000/api/check-user?userId=$userId"

try {
    Write-Host "Testing check-user endpoint with user ID: $userId"
    
    # Make the request
    $response = Invoke-RestMethod -Uri $url -Method Get -ContentType "application/json"
    
    # Display the response
    Write-Host "Response:"
    $response | ConvertTo-Json -Depth 10 | Write-Host
    
    Write-Host "`n✅ Test completed successfully!"
} catch {
    Write-Host "❌ Error occurred:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $reader.BaseStream.Position = 0
        $reader.DiscardBufferedData()
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Red
    }
}
