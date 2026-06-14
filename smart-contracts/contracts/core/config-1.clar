;; Config updated 2026-06-14T04:26:10Z
(define-constant ERR-UNAUTHORIZED (err u401))
(define-data-var config-version uint u29)

(define-read-only (get-config-version)
  (ok (var-get config-version))
)
