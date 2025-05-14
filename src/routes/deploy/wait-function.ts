import {GetJobCommand} from "@aws-sdk/client-amplify";

export async function waitForJobDone(
    amplify: any,
    appId: string,
    branchName: string,
    jobId: string,
    {
        pollEveryMs = 5_000,          // 5 s between polls
        timeoutMs   = 15 * 60_000,    // 15 min maximum
    } = {}
) {
    const startedAt = Date.now();

    while (true) {
        const { job } = await amplify.send(
            new GetJobCommand({ appId, branchName, jobId })
        );                                          // status enum values documented :contentReference[oaicite:0]{index=0}

        const status = job?.summary?.status as string;

        if (
            status === "SUCCEED" ||
            status === "FAILED"  ||
            status === "CANCELLED"
        ) return job!.summary!;                     // terminal → return summary

        if (Date.now() - startedAt > timeoutMs)
            throw new Error(
                `Timed out after ${timeoutMs / 1000}s waiting for job ${jobId} (last status ${status})`
            );

        await new Promise(r => setTimeout(r, pollEveryMs));   // wait & poll again
    }
}
