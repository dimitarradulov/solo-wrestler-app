import UIKit
import Capacitor
import WebKit

@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {

    var window: UIWindow?

    func application(_ application: UIApplication, didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey: Any]?) -> Bool {
        // Override point for customization after application launch.
        return true
    }

    func applicationWillResignActive(_ application: UIApplication) {
        // Sent when the application is about to move from active to inactive state. This can occur for certain types of temporary interruptions (such as an incoming phone call or SMS message) or when the user quits the application and it begins the transition to the background state.
        // Use this method to pause ongoing tasks, disable timers, and invalidate graphics rendering callbacks. Games should use this method to pause the game.
    }

    func applicationDidEnterBackground(_ application: UIApplication) {
        // Use this method to release shared resources, save user data, invalidate timers, and store enough application state information to restore your application to its current state in case it is terminated later.
        // If your application supports background execution, this method is called instead of applicationWillTerminate: when the user quits.
    }

    func applicationWillEnterForeground(_ application: UIApplication) {
        // Called as part of the transition from the background to the active state; here you can undo many of the changes made on entering the background.
    }

    func applicationDidBecomeActive(_ application: UIApplication) {
        // Restart any tasks that were paused (or not yet started) while the application was inactive. If the application was previously in the background, optionally refresh the user interface.
    }

    func applicationWillTerminate(_ application: UIApplication) {
        // Called when the application is about to terminate. Save data if appropriate. See also applicationDidEnterBackground:.
    }

    func application(_ app: UIApplication, open url: URL, options: [UIApplication.OpenURLOptionsKey: Any] = [:]) -> Bool {
        // Called when the app was launched with a url. Feel free to add additional processing here,
        // but if you want the App API to support tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(app, open: url, options: options)
    }

    func application(_ application: UIApplication, continue userActivity: NSUserActivity, restorationHandler: @escaping ([UIUserActivityRestoring]?) -> Void) -> Bool {
        // Called when the app was launched with an activity, including Universal Links.
        // Feel free to add additional processing here, but if you want the App API to support
        // tracking app url opens, make sure to keep this call
        return ApplicationDelegateProxy.shared.application(application, continue: userActivity, restorationHandler: restorationHandler)
    }

}

@objc(TechniqueVideoPlayerPlugin)
public class TechniqueVideoPlayerPlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "TechniqueVideoPlayerPlugin"
    public let jsName = "TechniqueVideoPlayer"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "open", returnType: CAPPluginReturnPromise),
    ]

    private var activeCall: CAPPluginCall?

    @objc func open(_ call: CAPPluginCall) {
        guard activeCall == nil else {
            call.reject("Technique video is already open.")
            return
        }

        guard
            let videoId = call.getString("videoId"),
            videoId.range(
                of: #"^[A-Za-z0-9_-]{11}$"#,
                options: .regularExpression
            ) != nil
        else {
            call.reject("A valid YouTube videoId is required.")
            return
        }

        guard let presentingViewController = bridge?.viewController else {
            call.reject("Technique video cannot open without a bridge view controller.")
            return
        }

        activeCall = call

        DispatchQueue.main.async { [weak self] in
            let controller = TechniqueVideoPlayerViewController(
                videoId: videoId,
                bundleIdentifier: Bundle.main.bundleIdentifier ?? "app",
                onClose: { [weak self] in
                    self?.activeCall?.resolve()
                    self?.activeCall = nil
                }
            )

            controller.modalPresentationStyle = .fullScreen
            controller.isModalInPresentation = true
            presentingViewController.present(controller, animated: true)
        }
    }
}

class MainViewController: CAPBridgeViewController {
    override open func capacitorDidLoad() {
        bridge?.registerPluginInstance(TechniqueVideoPlayerPlugin())
    }
}

private final class TechniqueVideoPlayerViewController:
    UIViewController,
    WKScriptMessageHandler,
    WKUIDelegate
{
    private let videoId: String
    private let bundleIdentifier: String
    private let onClose: () -> Void
    private let webView: WKWebView
    private let playerContainer = UIView()
    private let loadingOverlay = UIView()
    private let errorOverlay = UIView()
    private let errorMessageLabel = UILabel()
    private let timeoutInterval: TimeInterval = 15

    private var timeoutWorkItem: DispatchWorkItem?
    private var hasClosed = false
    private var isReady = false
    private let leakAvoider = LeakAvoider()

    init(videoId: String, bundleIdentifier: String, onClose: @escaping () -> Void) {
        self.videoId = videoId
        self.bundleIdentifier = bundleIdentifier
        self.onClose = onClose

        let userContentController = WKUserContentController()
        userContentController.add(leakAvoider, name: "soloTechniqueVideo")

        let configuration = WKWebViewConfiguration()
        configuration.userContentController = userContentController
        configuration.allowsInlineMediaPlayback = true
        configuration.mediaTypesRequiringUserActionForPlayback = []

        self.webView = WKWebView(frame: .zero, configuration: configuration)

        super.init(nibName: nil, bundle: nil)

        leakAvoider.delegate = self
    }

    @available(*, unavailable)
    required init?(coder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }

    override func viewDidLoad() {
        super.viewDidLoad()

        view.backgroundColor = UIColor(red: 18 / 255, green: 20 / 255, blue: 23 / 255, alpha: 1)

        buildLayout()
        loadPlayer()

        NotificationCenter.default.addObserver(
            self,
            selector: #selector(handleAppDidEnterBackground),
            name: UIApplication.didEnterBackgroundNotification,
            object: nil
        )
    }

    override func viewDidDisappear(_ animated: Bool) {
        super.viewDidDisappear(animated)

        if presentingViewController == nil || isBeingDismissed {
            completeCloseIfNeeded()
        }
    }

    deinit {
        NotificationCenter.default.removeObserver(self)
        webView.configuration.userContentController.removeScriptMessageHandler(
            forName: "soloTechniqueVideo"
        )
    }

    func userContentController(
        _ userContentController: WKUserContentController,
        didReceive message: WKScriptMessage
    ) {
        guard message.name == "soloTechniqueVideo" else {
            return
        }

        guard let body = message.body as? [String: Any],
              let type = body["type"] as? String
        else {
            return
        }

        switch type {
        case "ready":
            handleReady()
        case "error":
            let message = body["message"] as? String ?? "Unable to load the technique video."
            showError(message)
        default:
            break
        }
    }

    private func buildLayout() {
        let bar = UIView()
        bar.translatesAutoresizingMaskIntoConstraints = false
        view.addSubview(bar)

        let titleLabel = UILabel()
        titleLabel.translatesAutoresizingMaskIntoConstraints = false
        titleLabel.text = "Technique Video"
        titleLabel.textColor = .white
        titleLabel.font = .boldSystemFont(ofSize: 20)

        let closeButton = UIButton(type: .system)
        closeButton.translatesAutoresizingMaskIntoConstraints = false
        closeButton.setTitle("Close", for: .normal)
        closeButton.addTarget(self, action: #selector(closeTapped), for: .touchUpInside)

        bar.addSubview(titleLabel)
        bar.addSubview(closeButton)

        playerContainer.translatesAutoresizingMaskIntoConstraints = false
        playerContainer.backgroundColor = .black
        playerContainer.layer.cornerRadius = 12
        playerContainer.clipsToBounds = true

        webView.translatesAutoresizingMaskIntoConstraints = false
        webView.backgroundColor = .black
        webView.isOpaque = false
        webView.uiDelegate = self

        loadingOverlay.translatesAutoresizingMaskIntoConstraints = false
        loadingOverlay.backgroundColor = .black

        let loadingStack = UIStackView()
        loadingStack.translatesAutoresizingMaskIntoConstraints = false
        loadingStack.axis = .vertical
        loadingStack.spacing = 12
        loadingStack.alignment = .center

        let spinner = UIActivityIndicatorView(style: .large)
        spinner.startAnimating()

        let loadingLabel = UILabel()
        loadingLabel.text = "Loading video…"
        loadingLabel.textColor = .white

        loadingStack.addArrangedSubview(spinner)
        loadingStack.addArrangedSubview(loadingLabel)
        loadingOverlay.addSubview(loadingStack)

        errorOverlay.translatesAutoresizingMaskIntoConstraints = false
        errorOverlay.backgroundColor = .black
        errorOverlay.isHidden = true

        let errorStack = UIStackView()
        errorStack.translatesAutoresizingMaskIntoConstraints = false
        errorStack.axis = .vertical
        errorStack.spacing = 16
        errorStack.alignment = .center

        let errorTitle = UILabel()
        errorTitle.text = "Unable to load video"
        errorTitle.textColor = .white
        errorTitle.font = .boldSystemFont(ofSize: 18)

        errorMessageLabel.textColor = .white
        errorMessageLabel.numberOfLines = 0
        errorMessageLabel.textAlignment = .center

        let actionStack = UIStackView()
        actionStack.axis = .horizontal
        actionStack.spacing = 12

        let retryButton = UIButton(type: .system)
        retryButton.setTitle("Retry", for: .normal)
        retryButton.addTarget(self, action: #selector(retryTapped), for: .touchUpInside)

        let closeErrorButton = UIButton(type: .system)
        closeErrorButton.setTitle("Close", for: .normal)
        closeErrorButton.addTarget(self, action: #selector(closeTapped), for: .touchUpInside)

        actionStack.addArrangedSubview(retryButton)
        actionStack.addArrangedSubview(closeErrorButton)

        errorStack.addArrangedSubview(errorTitle)
        errorStack.addArrangedSubview(errorMessageLabel)
        errorStack.addArrangedSubview(actionStack)
        errorOverlay.addSubview(errorStack)

        playerContainer.addSubview(webView)
        playerContainer.addSubview(loadingOverlay)
        playerContainer.addSubview(errorOverlay)
        view.addSubview(playerContainer)

        NSLayoutConstraint.activate([
            bar.topAnchor.constraint(equalTo: view.safeAreaLayoutGuide.topAnchor, constant: 16),
            bar.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
            bar.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16),

            titleLabel.leadingAnchor.constraint(equalTo: bar.leadingAnchor),
            titleLabel.centerYAnchor.constraint(equalTo: closeButton.centerYAnchor),
            closeButton.topAnchor.constraint(equalTo: bar.topAnchor),
            closeButton.trailingAnchor.constraint(equalTo: bar.trailingAnchor),
            closeButton.bottomAnchor.constraint(equalTo: bar.bottomAnchor),

            playerContainer.topAnchor.constraint(equalTo: bar.bottomAnchor, constant: 16),
            playerContainer.leadingAnchor.constraint(equalTo: view.leadingAnchor, constant: 16),
            playerContainer.trailingAnchor.constraint(equalTo: view.trailingAnchor, constant: -16),
            playerContainer.heightAnchor.constraint(
                equalTo: playerContainer.widthAnchor,
                multiplier: 9.0 / 16.0
            ),

            webView.topAnchor.constraint(equalTo: playerContainer.topAnchor),
            webView.leadingAnchor.constraint(equalTo: playerContainer.leadingAnchor),
            webView.trailingAnchor.constraint(equalTo: playerContainer.trailingAnchor),
            webView.bottomAnchor.constraint(equalTo: playerContainer.bottomAnchor),

            loadingOverlay.topAnchor.constraint(equalTo: playerContainer.topAnchor),
            loadingOverlay.leadingAnchor.constraint(equalTo: playerContainer.leadingAnchor),
            loadingOverlay.trailingAnchor.constraint(equalTo: playerContainer.trailingAnchor),
            loadingOverlay.bottomAnchor.constraint(equalTo: playerContainer.bottomAnchor),

            loadingStack.centerXAnchor.constraint(equalTo: loadingOverlay.centerXAnchor),
            loadingStack.centerYAnchor.constraint(equalTo: loadingOverlay.centerYAnchor),

            errorOverlay.topAnchor.constraint(equalTo: playerContainer.topAnchor),
            errorOverlay.leadingAnchor.constraint(equalTo: playerContainer.leadingAnchor),
            errorOverlay.trailingAnchor.constraint(equalTo: playerContainer.trailingAnchor),
            errorOverlay.bottomAnchor.constraint(equalTo: playerContainer.bottomAnchor),

            errorStack.centerXAnchor.constraint(equalTo: errorOverlay.centerXAnchor),
            errorStack.centerYAnchor.constraint(equalTo: errorOverlay.centerYAnchor),
            errorStack.leadingAnchor.constraint(
                greaterThanOrEqualTo: errorOverlay.leadingAnchor,
                constant: 24
            ),
            errorStack.trailingAnchor.constraint(
                lessThanOrEqualTo: errorOverlay.trailingAnchor,
                constant: -24
            ),
        ])
    }

    private func loadPlayer() {
        isReady = false
        loadingOverlay.isHidden = false
        errorOverlay.isHidden = true
        timeoutWorkItem?.cancel()

        let timeoutWorkItem = DispatchWorkItem { [weak self] in
            self?.showError("Technique Video could not start within 15 seconds.")
        }

        self.timeoutWorkItem = timeoutWorkItem
        DispatchQueue.main.asyncAfter(deadline: .now() + timeoutInterval, execute: timeoutWorkItem)

        let baseUrlString = "https://\(bundleIdentifier).app"
        let html = buildPlayerHtml(origin: baseUrlString)

        webView.loadHTMLString(html, baseURL: URL(string: baseUrlString))
    }

    private func buildPlayerHtml(origin: String) -> String {
        """
        <!doctype html>
        <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <style>
              html, body { margin: 0; height: 100%; background: #000; overflow: hidden; }
              #player { width: 100%; height: 100%; }
            </style>
          </head>
          <body>
            <div id="player"></div>
            <script>
              let player = null;
              function send(type, message) {
                window.webkit.messageHandlers.soloTechniqueVideo.postMessage({
                  type,
                  message
                });
              }
              function onYouTubeIframeAPIReady() {
                player = new YT.Player('player', {
                  videoId: '\(videoId)',
                  playerVars: {
                    autoplay: 1,
                    controls: 1,
                    playsinline: 1,
                    fs: 1,
                    rel: 0,
                    origin: '\(origin)'
                  },
                  events: {
                    onReady: function() {
                      send('ready');
                      player.playVideo();
                    },
                    onError: function(event) {
                      send('error', 'YouTube error ' + event.data);
                    }
                  }
                });
              }
              window.__soloPauseVideo = function() {
                if (player) {
                  player.pauseVideo();
                }
              };
            </script>
            <script src="https://www.youtube.com/iframe_api"></script>
          </body>
        </html>
        """
    }

    private func handleReady() {
        timeoutWorkItem?.cancel()
        loadingOverlay.isHidden = true
        errorOverlay.isHidden = true
        isReady = true
    }

    private func showError(_ message: String) {
        timeoutWorkItem?.cancel()
        loadingOverlay.isHidden = true
        errorMessageLabel.text = message
        errorOverlay.isHidden = false
        pausePlayback()
    }

    private func pausePlayback() {
        guard isReady else {
            return
        }

        webView.evaluateJavaScript(
            "window.__soloPauseVideo && window.__soloPauseVideo();",
            completionHandler: nil
        )
    }

    private func completeCloseIfNeeded() {
        guard !hasClosed else {
            return
        }

        hasClosed = true
        timeoutWorkItem?.cancel()
        onClose()
    }

    @objc private func retryTapped() {
        loadPlayer()
    }

    @objc private func closeTapped() {
        dismiss(animated: true) { [weak self] in
            self?.completeCloseIfNeeded()
        }
    }

    @objc private func handleAppDidEnterBackground() {
        pausePlayback()
    }
}

private final class LeakAvoider: NSObject, WKScriptMessageHandler {
    weak var delegate: WKScriptMessageHandler?

    func userContentController(
        _ userContentController: WKUserContentController,
        didReceive message: WKScriptMessage
    ) {
        delegate?.userContentController(userContentController, didReceive: message)
    }
}
