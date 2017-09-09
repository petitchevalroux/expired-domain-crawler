# expired-domain-crawler


## Monitoring

```
watch -d "echo "to download" && redis-cli llen exd:urls:todownload && echo "to filter" && redis-cli llen exd:urls:tofilter && echo "no dns" &&  redis-cli zcard exd:domain:lastNoMatchingDns && echo "available" && redis-cli zcard exd:domain:lastAvailable && echo "downloaded" && redis-cli zcard exd:url:lastDownloaded"
```