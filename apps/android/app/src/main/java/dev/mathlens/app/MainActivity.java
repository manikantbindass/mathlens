package dev.mathlens.app;

import android.app.Activity;
import android.content.ActivityNotFoundException;
import android.content.Intent;
import android.graphics.Color;
import android.net.Uri;
import android.os.Bundle;
import android.view.Menu;
import android.view.MenuItem;
import android.webkit.CookieManager;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

/** Online client: no native JavaScript bridge and no local compute server. */
public class MainActivity extends Activity {
    public static final String HOME="https://mathlens-wine.vercel.app";
    private WebView webView;
    private ValueCallback<Uri[]> fileCallback;
    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        webView=new WebView(this);
        webView.setId(1001);
        webView.setBackgroundColor(Color.rgb(5,5,5));
        WebSettings settings=webView.getSettings();
        settings.setJavaScriptEnabled(true);
        settings.setDomStorageEnabled(true);
        settings.setAllowFileAccess(false);
        settings.setAllowContentAccess(true);
        settings.setMixedContentMode(WebSettings.MIXED_CONTENT_NEVER_ALLOW);
        settings.setSafeBrowsingEnabled(true);
        CookieManager.getInstance().setAcceptThirdPartyCookies(webView,false);
        webView.setWebViewClient(new WebViewClient(){
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request){
                Uri url=request.getUrl();
                if("https".equals(url.getScheme())&&"mathlens-wine.vercel.app".equals(url.getHost()))return false;
                if("https".equals(url.getScheme()))openBrowser(url);
                return true;
            }
        });
        webView.setWebChromeClient(new WebChromeClient(){
            @Override public boolean onShowFileChooser(WebView view,ValueCallback<Uri[]> callback,FileChooserParams params){
                if(fileCallback!=null)fileCallback.onReceiveValue(null);
                fileCallback=callback;
                Intent intent=new Intent(Intent.ACTION_OPEN_DOCUMENT).setType("text/*").addCategory(Intent.CATEGORY_OPENABLE);
                try{startActivityForResult(intent,2001);return true;}catch(ActivityNotFoundException error){fileCallback=null;return false;}
            }
        });
        webView.setDownloadListener((url,agent,disposition,mime,length)->Toast.makeText(this,"Use the browser version for result downloads. Menu: Open in browser.",Toast.LENGTH_LONG).show());
        setContentView(webView);
        // Android 15 lays out behind system bars by default; reserve those insets.
        webView.setOnApplyWindowInsetsListener((view,insets)->{view.setPadding(insets.getSystemWindowInsetLeft(),insets.getSystemWindowInsetTop(),insets.getSystemWindowInsetRight(),insets.getSystemWindowInsetBottom());return insets;});
        if(state==null)webView.loadUrl(HOME);else webView.restoreState(state);
    }
    private void openBrowser(Uri url){try{startActivity(new Intent(Intent.ACTION_VIEW,url));}catch(ActivityNotFoundException error){Toast.makeText(this,"No browser is available.",Toast.LENGTH_SHORT).show();}}
    @Override public boolean onCreateOptionsMenu(Menu menu){menu.add(0,1,0,"Reload");menu.add(0,2,1,"Open in browser");return true;}
    @Override public boolean onOptionsItemSelected(MenuItem item){if(item.getItemId()==1){webView.reload();return true;}if(item.getItemId()==2){openBrowser(Uri.parse(HOME));return true;}return super.onOptionsItemSelected(item);}
    @Override protected void onSaveInstanceState(Bundle out){webView.saveState(out);super.onSaveInstanceState(out);}
    @Override protected void onActivityResult(int request,int result,Intent data){super.onActivityResult(request,result,data);if(request==2001&&fileCallback!=null){fileCallback.onReceiveValue(result==RESULT_OK&&data!=null?new Uri[]{data.getData()}:null);fileCallback=null;}}
    @SuppressWarnings("deprecation") @Override public void onBackPressed(){if(webView.canGoBack())webView.goBack();else super.onBackPressed();}
    @Override protected void onDestroy(){if(fileCallback!=null)fileCallback.onReceiveValue(null);webView.destroy();super.onDestroy();}
}
