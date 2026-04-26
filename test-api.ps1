$body = @{title='Test Note'} | ConvertTo-Json
$r = Invoke-RestMethod -Uri 'http://localhost:8000/api/notes' -Method POST -ContentType 'application/json' -Body $body
$r | ConvertTo-Json