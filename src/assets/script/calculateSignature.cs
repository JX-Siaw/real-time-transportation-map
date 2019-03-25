    string key = "9c132d31-6a30-4cac-8d8b-8a1970834799"; // supplied by PTV
    int developerId = 2; // supplied by PTV
    string url = "/v2/mode/2/line/787/stops-for-line"; // the PTV api method we want

    // add developer id
    url = string.Format("{0}{1}devid={2}", url, url.Contains("?") ? "&" : "?",developerId);
System.Text.ASCIIEncoding encoding = new System.Text.ASCIIEncoding();
    // encode key
    byte[] keyBytes = encoding.GetBytes(key);
    // encode url
    byte[] urlBytes = encoding.GetBytes(url);
    byte[] tokenBytes = new System.Security.Cryptography.HMACSHA1(keyBytes).ComputeHash(urlBytes);
    var sb = new System.Text.StringBuilder();
    // convert signature to string
    Array.ForEach<byte>(tokenBytes, x => sb.Append(x.ToString("X2")));
// add signature to url
url = string.Format("{0}&signature={1}", url, sb.ToString());

    // extra code to add base URL – the resultant url should be:
    //  http://timetableapi.ptv.vic.gov.au/v2/mode/2/line/787/stops-for-line?devid=2&signature=D5474F344CDAA7B92F2253169F6C1D66C1A15001