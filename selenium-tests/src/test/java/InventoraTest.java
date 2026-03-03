import java.net.HttpURLConnection;
import java.net.URL;

import org.openqa.selenium.WebDriver;
import org.openqa.selenium.chrome.ChromeDriver;
import org.openqa.selenium.chrome.ChromeOptions;
import org.testng.Assert;
import org.testng.annotations.*;

public class InventoraTest {
    WebDriver driver;

    // ========== DEVELOPER A TESTS (Backend API) ==========

    // Test Case 1: Verify Backend Health Check API
    @Test(priority = 1)
    public void testBackendHealthCheck() throws Exception {
        URL url = new URL("http://localhost:5000/health");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("GET");
        int responseCode = conn.getResponseCode();
        Assert.assertEquals(responseCode, 200,
                "Backend /health endpoint should return 200 OK");
        conn.disconnect();
    }

    // Test Case 2: Verify Login API rejects invalid credentials
    @Test(priority = 2)
    public void testLoginAPIInvalidCredentials() throws Exception {
        URL url = new URL("http://localhost:5000/api/auth/login");
        HttpURLConnection conn = (HttpURLConnection) url.openConnection();
        conn.setRequestMethod("POST");
        conn.setRequestProperty("Content-Type", "application/json");
        conn.setDoOutput(true);
        String body = "{\"email\":\"wrong@test.com\",\"password\":\"wrongpass\"}";
        conn.getOutputStream().write(body.getBytes());
        int responseCode = conn.getResponseCode();
        Assert.assertTrue(responseCode == 401 || responseCode == 400,
                "Login with invalid credentials should return 401 or 400");
        conn.disconnect();
    }
}
