;; Config updated 2026-05-31T02:32:51Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u78)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
